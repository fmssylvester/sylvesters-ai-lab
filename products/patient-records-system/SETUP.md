# Patient Records Lookup — Setup Guide

## Prerequisites
- n8n instance (self-hosted or cloud)
- Google Sheets access (or any database)
- Twilio account with SMS capability (for phone-based lookup)

## Installation

1. **Import the Workflow**
   - Open your n8n dashboard
   - Go to **Workflows → Import from File**
   - Select `workflow-patient-lookup.json`

2. **Configure Credentials**
   - **Google Sheets**: Connect your Google account (reads patient data)
   - **Twilio**: Add your Account SID and Auth Token
   - **OpenAI**: Add your API key for AI-powered responses

3. **Set Up Patient Data**
   - Copy the sample data from `google-sheet-template.csv`
   - Create a Google Sheet with the same columns
   - Share the sheet with the n8n Google Sheets integration
   - Update the Spreadsheet ID in the workflow

4. **Activate Webhook**
   - Find the **Webhook** node in the workflow
   - Copy the production URL
   - Configure your phone system or frontend to POST to this URL

## Testing
Send a POST request with patient name or ID:
```json
{ "query": "John Doe" }
```
The workflow will return the matching patient record.

## Customization
- Modify the AI prompt in the **OpenAI** node for your preferred response format
- Add more data sources (Airtable, MySQL, etc.) by adding nodes
- Adjust the SMS template in the **Twilio** node

## Troubleshooting
- **No results found**: Check the Google Sheet data and sharing permissions
- **SMS not sending**: Verify Twilio credentials and phone number
- **Webhook not triggering**: Ensure the POST URL is correct and publicly accessible
