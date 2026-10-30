#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null; then echo 'Node.js LTS requis (https://nodejs.org/)'; exit 1; fi
node server.js &
pid=$!
trap 'kill "$pid" 2>/dev/null || true' EXIT INT TERM
sleep 1
xdg-open 'http://localhost:3000' >/dev/null 2>&1 || true
wait "$pid"
