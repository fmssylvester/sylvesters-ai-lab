# AI Agent with Memory & Tools — Setup Guide

## What You Get
- A fully functional n8n AI Agent with 20-message memory, calculator, and Wikipedia lookup
- Works out of the box with just an OpenAI API key
- No additional API keys required for tools

## Requirements
- n8n instance (self-hosted or cloud at app.n8n.cloud)
- OpenAI API key (sign up at platform.openai.com)

## Setup Steps

### Step 1: Import the Workflow
1. Open your n8n dashboard
2. Go to **Workflows** → **Import from File**
3. Select `template.json`
4. The workflow will appear with 7 connected nodes

### Step 2: Add Your OpenAI API Key
1. Double-click the **OpenAI Chat Model** node
2. Click the **+** next to "Credential for OpenAI"
3. Select **OpenAI** from the dropdown
4. Paste your API key
5. Click **Save**

### Step 3: Activate the Webhook
1. Double-click the **Webhook** node
2. Click **Listen for Test Event** (to get your webhook URL)
3. Copy the URL shown (e.g., `https://your-n8n.com/webhook/ai-agent`)
4. Click **Activate**

### Step 4: Test It
Send a POST request to your webhook URL:
```json
{
  "message": "What is 247 * 389?",
  "sessionId": "test-session-1"
}
```

The agent will use the Calculator tool and respond with the answer.

## API Format

### Request
```json
{
  "message": "your question here",
  "sessionId": "unique-session-id"
}
```

### Response
```json
{
  "success": true,
  "response": "The answer from the AI agent",
  "conversationId": "session-id",
  "timestamp": "2026-07-30T..."
}
```

## Available Tools

| Tool | What It Does | API Key Required |
|------|-------------|-----------------|
| **Calculator** | Solves math problems, arithmetic, conversions | No |
| **Wikipedia** | Looks up facts, history, science, biography | No |

## Customization

### Adding More Tools
1. Add a Tool node (e.g., SerpAPI for web search)
2. Connect its `ai_tool` output to the AI Agent's `ai_tool` input
3. The agent will automatically discover and use it

### Adjusting Memory
- Change `contextWindowLength` in **Window Buffer Memory** to store more/fewer messages
- Default: 20 messages (covers most conversations)

### Changing the Model
- Replace **OpenAI Chat Model** with Claude, Gemini, or any n8n-supported LLM
- No other changes needed

## Troubleshooting

**Q: The agent doesn't use tools**
A: Make sure the system prompt explicitly mentions the tools. The default prompt guides the agent well.

**Q: "Unauthorized" error**
A: Your OpenAI API key is missing or invalid. Check the credential in the OpenAI Chat Model node.

**Q: Webhook returns 404**
A: Activate the workflow first. The webhook only works when the workflow is active.

## Need Help?
Open an issue on GitHub or reach out on Gumroad.
