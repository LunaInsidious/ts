#!/usr/bin/env bash
set -euo pipefail

url="${1:-http://localhost:3000/sse}"
curl -N "$url"
