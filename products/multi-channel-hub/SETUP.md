# Multi-Channel Communication Hub — Setup Guide

## Prerequisites
- n8n instance (self-hosted or cloud)
- OpenAI API key
- At least one channel account:
  - **WhatsApp**: WhatsApp Business API account
  - **Telegram**: Bot token from @BotFather
  - **SMS**: Twilio account with SMS-capable number

## Installation

1. **Import the Workflow**
   - Open your n8n dashboard
   - Go to **Workflows → Import from File**
   - Select `template.json`

2. **Configure Credentials**
   - **OpenAI**: Add your API key
   - **WhatsApp**: Connect your WhatsApp Business Account
   - **Telegram**: Add your Bot Token
   - **Twilio**: Add Account SID and Auth Token

3. **Activate Webhook**
   - Find the **Webhook** node
   - Copy the production URL
   - Configure your channels to POST to this URL:
     ```
     https://your-n8n.app/webhook/multi-channel
     ```

4. **Configure Sending**
   - **WhatsApp**: Set your Business Phone ID in the Send WhatsApp node
   - **Telegram**: Set the target Chat ID
   - **SMS**: Set your Twilio from number

## Testing

Send a test message to each channel:
```json
{
  "channel": "whatsapp",
  "message": "I need help with my order",
  "to": "+1234567890"
}
```
```json
{
  "channel": "telegram",
  "message": "What are your business hours?",
  "chatId": "@username"
}
```
```json
{
  "channel": "sms",
  "message": "Is my appointment confirmed?",
  "to": "+1234567890",
  "fromNumber": "+1987654321"
}
```

## Customization
- Modify the AI system prompt for your business context
- Adjust response length limits per channel
- Add more channels by extending the Router node
- Connect a database node for CRM integration

## Troubleshooting
- **WhatsApp not sending**: Verify Business API access and phone number
- **Telegram not responding**: Check bot token and chat ID
- **SMS not sending**: Verify Twilio balance and from number
- **AI not responding**: Check OpenAI API key and quota
