#!/bin/bash

INPUT_FILE=$1

if [ -z "$INPUT_FILE" ]; then
  echo "Usage: ./generate.sh examples/input-dev.json"
  exit 1
fi

echo "=== Generating configuration ==="

cat <<EOF > prompt.txt
$(cat CLAUDE.md)

INPUT:
$(cat $INPUT_FILE)
EOF

echo "Send this prompt to Claude:"
echo "-----------------------------------"
cat prompt.txt
echo "-----------------------------------"
echo "Paste output into /generated/"