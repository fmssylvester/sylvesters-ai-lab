## Template 1: AI Customer Support Agent

### Installation
1. Download the JSON file
2. In n8n, go to **Workflows → Add Workflow → Import from File**
3. Select the downloaded JSON
4. The workflow appears with 4 nodes: Webhook → AI Agent → OpenAI Model → Respond to Webhook

### Configuration
1. **OpenAI Chat Model** — already set to `gpt-5-mini` with n8n managed credits (no API key needed on n8n Cloud). On self-hosted n8n, add your OpenAI API key in Credentials.
2. **AI Agent** — the system prompt is pre-filled with escalation rules. Edit if you want custom behavior.
3. **Webhook** — defaults to `POST /customer-support`. Change the path if needed.

### Usage
Send a POST request to `https://your-n8n/webhook/customer-support` with JSON body:
```json
{
  "message": "Hi, I can't find the export button. Where is it?"
}
```
The workflow returns:
```json
{
  "success": true,
  "response": "I can help with that!..."
}
```

### Testing
- Use **Workflow → Execute Workflow** with sample data in n8n
- Or use curl: `curl -X POST https://your-n8n/webhook/customer-support -H "Content-Type: application/json" -d '{"message":"Hello"}'`

---

## Template 2: Missed Call SMS Text-Back

### Installation
1. Download the JSON file
2. In n8n, go to **Workflows → Add Workflow → Import from File**
3. Select the downloaded JSON
4. The workflow appears with 5 nodes: Webhook → Format Data → AI Agent → OpenAI Model → Respond to Webhook

### Configuration
1. **OpenAI Chat Model** — pre-configured with n8n managed credits (n8n Cloud) or add your OpenAI key (self-hosted)
2. **Send SMS via Twilio** — you must connect your Twilio account:
   - Create a Twilio credential in n8n (Settings → Credentials → Add → Twilio)
   - In the node, set **From Number** to your Twilio phone number
   - Ensure the account has SMS capability and sufficient balance
3. **Webhook** — defaults to `POST /missed-call`. Change path if needed.

### Usage
Send a POST request to `https://your-n8n/webhook/missed-call` with JSON body:
```json
{
  "phone": "+15551234567",
  "business": "City Dental Clinic",
  "timestamp": "2026-07-25T17:30:00Z"
}
```
The workflow generates an AI SMS, sends it via Twilio, and returns:
```json
{
  "success": true,
  "sentTo": "+15551234567",
  "message": "Hi there, sorry we missed your call..."
}
```

### Testing (without Twilio)
Pin data to the Format Data node to test SMS generation without sending:
- Right-click Format Data → Pin Data → Add sample input
- Execute the workflow — the AI generates the SMS text, Twilio will error (expected without credentials)
- Check the AI Agent output for the generated message

### Phone System Integration
- **Twilio Studio/Phone Numbers:** Set the webhook URL as the voice fallback URL
- **Custom PBX:** Configure missed-call notifications to POST to the webhook
- **API calls:** Any system that can POST JSON can trigger this workflow
