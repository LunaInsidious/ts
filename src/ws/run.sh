#!/bin/bash
set -eu

host="${1:-localhost}"

ips=($(dig "$host" A +short))

for ip in "${ips[@]}"; do
    # もしhost名/ip名のディレクトリがなければ作成
    mkdir -p "heapsnapshots/$host/$ip"
    output_path="heapsnapshots/$host/$ip/$(date +%Y%m%d_%H%M%S).heapsnapshot"
    node ./take-heapsnapshot.mjs "$ip":9229 "$output_path"
done
