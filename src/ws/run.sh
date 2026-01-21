#!/bin/bash
set -eu

host="${1:-localhost}"

ips=($(dig "$host" A +short))

for ip in "${ips[@]}"; do
    # これからoutputする予定のディレクトリがあるか確認
    # heapsnapshots/host/(date +%Y%m%d_%H%M%S)-ipの形で、dateの部分は作成時刻なので、毎回変わる。正規表現でマッチさせる
    output_dir=$(find heapsnapshots/"$host"/ -type d -regextype posix-extended -regex ".*/[0-9]{8}_[0-9]{6}-$ip" | head -n 1 || true)
    if [ -z "$output_dir" ]; then
        # なければ新規作成
        output_dir=heapsnapshots/"$host"/"$(date +%Y%m%d_%H%M%S)"-"$ip"
        mkdir -p "$output_dir"
    fi
    output_path="$output_dir/$(date +%Y%m%d_%H%M%S).heapsnapshot"
    node ./take-heapsnapshot.mjs "$ip":9229 "$output_path"
done
