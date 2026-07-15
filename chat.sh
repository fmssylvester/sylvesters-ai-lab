#!/bin/bash
PROMPT=$1
FILE_CONTENT=$(cat "$2")

# Send to local Ollama API using the installed Qwen model
curl -s http://localhost:11434/api/chat -d "{
  \"model\": \"qwen3.5:4b\",
  \"messages\": [
    {\"role\": \"user\", \"content\": \"Task: Update this code. Instruction: $PROMPT. \n\nCODE:\n$FILE_CONTENT\"}
  ],
  \"stream\": false
}" | jq -r '.message.content'
