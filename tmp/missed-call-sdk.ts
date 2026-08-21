import { workflow, node, trigger, sticky, placeholder, newCredential, ifElse, switchCase, merge, splitInBatches, nextBatch, languageModel, memory, tool, outputParser, embedding, embeddings, vectorStore, retriever, documentLoader, textSplitter, reranker, fromAi, expr } from '@n8n/workflow-sdk';

const openAiModel = languageModel({
  type: '@n8n/n8n-nodes-langchain.lmChatOpenAi', version: 1.3,
  config: { name: 'OpenAI Chat Model', parameters: {} }
});

const webhookTrigger = trigger({
  type: 'n8n-nodes-base.webhook', version: 2,
  config: { name: 'Webhook', parameters: { httpMethod: 'POST', path: 'missed-call', responseMode: 'responseNode', options: {} }, position: [0, 300] },
  output: [{ body: { phone: '+15551234567', business: 'City Dental Clinic', timestamp: '2026-07-25T17:30:00Z' } }]
});

const formatData = node({
  type: 'n8n-nodes-base.set', version: 3.1,
  config: {
    name: 'Format Data', position: [250, 300],
    parameters: {
      mode: 'manual',
      includeOtherFields: true,
      assignments: {
        assignments: [
          { id: 'phone', name: 'phoneNumber', value: expr('{{ $json.body?.phone ?? $json.phone ?? $json.From ?? "" }}'), type: 'string' },
          { id: 'business', name: 'businessName', value: expr('{{ $json.body?.business ?? $json.business ?? "our practice" }}'), type: 'string' },
          { id: 'time', name: 'callTime', value: expr('{{ $json.body?.timestamp ?? $json.timestamp ?? $now.toISO() }}'), type: 'string' }
        ]
      }
    }
  },
  output: [{ phoneNumber: '+15551234567', businessName: 'City Dental Clinic', callTime: '2026-07-25T17:30:00Z' }]
});

const aiAgent = node({
  type: '@n8n/n8n-nodes-langchain.agent', version: 3.1,
  config: {
    name: 'SMS Generator Agent', position: [500, 300],
    parameters: {
      promptType: 'define',
      text: expr('Generate a friendly SMS reply for the missed call from {{ $json.businessName }} at {{ $json.callTime }}.'),
      options: {
        systemMessage: expr('You are an automated SMS assistant for {{ $json.businessName }}. A customer just called at {{ $json.callTime }} and missed reaching someone. Your ONLY job is to generate a friendly SMS reply that:\n\n1. Greets the customer by name if available (use "there" if unknown)\n2. Apologizes for missing their call\n3. Explains they can reply to this message to book an appointment or ask a question\n4. Keeps the tone warm and professional\n\nThe response should be a single SMS (under 160 characters if possible).'),
        maxIterations: 3
      }
    },
    subnodes: { model: openAiModel }
  },
  output: [{ output: 'Hi there! Sorry we missed your call at City Dental Clinic. Reply to book an appointment or ask anything. 😊' }]
});

const respondToWebhook = node({
  type: 'n8n-nodes-base.respondToWebhook', version: 1.1,
  config: {
    name: 'Respond to Webhook', position: [750, 300],
    parameters: {
      respondWith: 'json',
      responseBody: expr('{\n  "success": true,\n  "sentTo": "{{ $("Format Data").item.json.phoneNumber }}",\n  "message": "{{ $json.output }}",\n  "timestamp": "{{ $now.toISO() }}"\n}')
    }
  },
  output: [{ success: true, sentTo: '+15551234567', message: 'SMS reply text', timestamp: '2026-07-25T17:30:00Z' }]
});

export default workflow('missed-call-sms', 'Missed Call SMS Text-Back for Appointment Businesses')
  .add(webhookTrigger)
  .to(formatData)
  .to(aiAgent)
  .to(respondToWebhook)
  .add(openAiModel);
