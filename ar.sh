#!/bin/bash
# AgentRouter CLI - works directly
curl -s https://agentrouter.org/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-S9yvOgGdhjAhPqfmSVT73pRkt55fuXqkWeg7BgYw5W3239yW" \
  -H "X-Stainless-OS: Linux" \
  -H "X-Stainless-Arch: x64" \
  -H "X-Stainless-Lang: js" \
  -H "X-Stainless-Runtime: node" \
  -H "X-Stainless-Runtime-Version: v22.22.1" \
  -H "HTTP-Referer: https://github.com/RooVetGit/Roo-Cline" \
  -H "X-Title: Roo Code" \
  -H "User-Agent: RooCode/3.53.0" \
  -d "{\"model\":\"claude-opus-4-8\",\"messages\":[{\"role\":\"user\",\"content\":\"$1\"}],\"max_tokens\":4096}" 2>&1
