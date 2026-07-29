# AI Customer Support Agent — Setup Guide

## What You Get
- Ready-to-import n8n AI Customer Support Agent workflow
- Professional system prompt optimized for customer service
- Conversation memory (10-message window)
- Webhook endpoint for integration with any frontend

## Requirements
- n8n instance (cloud at app.n8n.cloud or self-hosted)
- OpenAI API key (gpt-4o-mini recommended — costs ~$0.002 per conversation)

## Setup

### 1. Import the Workflow
1. Open your n8n dashboard
2. Click **Workflows** → **Import from File**
3. Select `template.json`
4. Click **Import**

### 2. Configure OpenAI Credentials
1. Click the **OpenAI Chat Model** node
2. Under **Credential**, click **Create New** or select existing
3. Enter your OpenAI API key
4. Click **Save**

### 3. Configure Webhook
1. Click the **Webhook** node
2. Click **Listen** to activate the webhook
3. Copy the webhook URL shown (e.g., `https://your-instance.app.n8n.cloud/webhook/customer-support`)

### 4. Activate the Workflow
1. Click **Save** (top right)
2. Toggle **Active** on

### 5. Test It
Send a POST request to your webhook URL:

```json
{
  "message": "Hi, I need help with my account",
  "customerId": "user-123",
  "conversationId": "conv-456"
}
```

You'll receive a response like:
```json
{
  "success": true,
  "response": "Hello! I'm SupportAI, and I'm here to help you with your account. Could you please let me know what specific issue you're experiencing?",
  "conversationId": "conv-456",
  "timestamp": "2026-07-25T..."
}
```

## Customization

### Change the System Prompt
Edit the **AI Customer Support Agent** node → **System Message** to customize tone, brand voice, or company-specific knowledge.

### Add Tools
To give your agent capabilities like order lookup or FAQ search:
1. Add an **HTTP Request** node configured to call your API
2. Connect it to the AI Agent node by clicking the **+** under **Tools** on the AI Agent node
3. The AI Agent will automatically discover and use the tool

### Change the Model
Edit the **OpenAI Chat Model** node to use a different model (gpt-4o, gpt-4o-mini, etc.)

## Troubleshooting

| Issue | Fix |
|---|---|
| No response from webhook | Ensure workflow is **Active** |
| API key error | Check OpenAI credential is configured |
| Agent not using tools | Connect tool nodes to the AI Agent's **Tools** input |
| Slow responses | Use gpt-4o-mini instead of gpt-4o |

## Integration Examples

### Zapier/Zapier-like
Set the webhook URL as a **Webhook by Zapier** POST action.

### Website Chat Widget
Point your chat widget's API endpoint to the webhook URL.

### Make.com
Use **HTTP - Make a Request** module with POST method.
