#!/bin/bash
set -eu

target="${1:-localhost}"

# services.jsonから、受け取ったターゲット名を用いてホスト名とクラスター名、サービス名を取得
read -r host cluster service < <(
  jq -r --arg target "$target" '
    .services[$target]
    | if . == null then
        error("unknown target: \($target)")
      else
        [.host, .cluster, .service] | @tsv
      end
  ' ./config.json
)

read -r s3_bucket s3_path < <(
  jq -r '
    .s3
    | [.bucket, .path]
    | @tsv
  ' ./config.json
)

ips=($(dig "$host" A +short))

# ipとタスクIDの対応関係を保持
declare -A ipToTaskMap
tasks=$(aws ecs list-tasks --cluster "$cluster" --service "$service" --query 'taskArns' --output text)
for task_arn in $tasks; do
    ip=$(aws ecs describe-tasks --cluster "$cluster" --tasks "$task_arn" --query 'tasks[0].attachments[0].details[?name==`privateIPv4Address`].value' --output text)
    task_id=$(basename "$task_arn")
    ipToTaskMap["$ip"]="$task_id"
    echo "Mapped IP $ip to Task ID $task_id"
done

for ip in "${ips[@]}"; do
    task_id="${ipToTaskMap[$ip]}"
    # これからoutputする予定のディレクトリがあるか確認
    # heapsnapshots/host/(date +%Y%m%d_%H%M%S)-taskIDの形で、dateの部分は作成時刻なので、毎回変わる。正規表現でマッチさせる
    output_dir=$(find heapsnapshots/"$host"/ -type d -regextype posix-extended -regex ".*/[0-9]{8}_[0-9]{6}-$task_id" | head -n 1 || true)

    now=$(date +%Y%m%d_%H%M%S)
    if [ -z "$output_dir" ]; then
        # なければ新規作成
        output_dir=heapsnapshots/"$host"/"$now"-"$task_id"
        mkdir -p "$output_dir"
    fi
    output_path="$output_dir/$now.heapsnapshot"
    node ./take-heapsnapshot.mjs "$ip":9229 "$output_path"
    aws s3 cp "$output_path" "s3://$s3_bucket/$s3_path/$output_path"
    # ストレージ節約
    rm "$output_path"
done
