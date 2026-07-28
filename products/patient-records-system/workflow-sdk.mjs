import { workflow, node, trigger, sticky, placeholder, newCredential, ifElse, switchCase, merge, splitInBatches, nextBatch, languageModel, memory, tool, outputParser, embedding, embeddings, vectorStore, retriever, documentLoader, textSplitter, reranker, fromAi, expr } from '@n8n/workflow-sdk';

const webhookTrigger = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'Webhook',
    parameters: {
      httpMethod: 'POST',
      path: 'patient-lookup',
      responseMode: 'responseNode',
      options: {}
    },
    position: [-480, 300]
  },
  output: [{ body: { query: 'John' } }]
});

const extractQuery = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Extract Query',
    parameters: {
      mode: 'manual',
      includeOtherFields: false,
      assignments: {
        assignments: [
          { id: 'query', name: 'query', value: expr('{{ $json.body?.query ?? $json.query ?? "" }}'), type: 'string' }
        ]
      }
    },
    position: [-280, 300]
  },
  output: [{ query: 'John' }]
});

const searchPatients = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.2,
  config: {
    name: 'Search Google Sheets',
    parameters: {
      operation: 'get',
      documentId: placeholder('Your Google Sheet ID (e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74QvYxI)'),
      sheetId: placeholder('Your Sheet ID (default: 0)'),
      range: 'Patients!A:J',
      options: {}
    },
    credentials: { googleSheetsOAuth2Api: newCredential('Google Sheets') },
    position: [-80, 300]
  },
  output: [{ name: 'John Doe', age: '45', gender: 'Male', bloodType: 'O+', allergies: 'Penicillin', medications: 'Lisinopril', conditions: 'Hypertension', lastVisit: '2026-06-15', nextAppt: '2026-08-20', phone: '+2348012345678', urgency: 'stable', notes: 'Regular checkup' }]
});

const filterMatch = ifElse({
  version: 2.2,
  config: {
    name: 'Filter Match',
    parameters: {
      conditions: {
        options: { caseSensitive: false, typeValidation: 'loose' },
        conditions: [
          {
            leftValue: expr('{{ $json.name.toLowerCase() }}'),
            operator: { type: 'string', operation: 'contains' },
            rightValue: expr('{{ $("Extract Query").item.json.query.toLowerCase() }}')
          }
        ],
        combinator: 'and'
      }
    },
    position: [120, 300]
  }
});

const formatResponse = node({
  type: 'n8n-nodes-base.code',
  version: 3,
  config: {
    name: 'Format Response',
    parameters: {
      language: 'javaScript',
      code: `const patient = $input.first().json;

return [{
  json: {
    id: patient.id || patient.patientId || '',
    name: patient.name || '',
    age: patient.age || '',
    gender: patient.gender || '',
    bloodType: patient.bloodType || patient.blood_type || '',
    allergies: patient.allergies || 'None',
    medications: patient.medications || 'None',
    conditions: patient.conditions || 'None',
    lastVisit: patient.lastVisit || patient.last_visit || '',
    nextAppt: patient.nextAppt || patient.next_appointment || 'Not scheduled',
    phone: patient.phone || '',
    urgency: patient.urgency || 'stable',
    notes: patient.notes || ''
  }
}];`
    },
    position: [320, 200]
  },
  output: [{ name: 'John Doe', age: '45', gender: 'Male', bloodType: 'O+', allergies: 'Penicillin', found: true }]
});

const notFound = node({
  type: 'n8n-nodes-base.code',
  version: 3,
  config: {
    name: 'Not Found',
    parameters: {
      language: 'javaScript',
      code: "return [{ json: { error: 'Patient not found', found: false } }];"
    },
    position: [320, 420]
  },
  output: [{ error: 'Patient not found', found: false }]
});

const respondToWebhook = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.1,
  config: {
    name: 'Respond to Webhook',
    parameters: {
      respondWith: 'json',
      responseBody: expr('{{ $json }}'),
      options: {}
    },
    position: [560, 300]
  },
  output: [{ status: 'success' }]
});

export default workflow('patient-records-lookup', 'Patient Records Lookup')
  .add(webhookTrigger)
  .to(extractQuery)
  .to(searchPatients)
  .to(filterMatch
    .onTrue(formatResponse.to(respondToWebhook))
    .onFalse(notFound.to(respondToWebhook))
  );
