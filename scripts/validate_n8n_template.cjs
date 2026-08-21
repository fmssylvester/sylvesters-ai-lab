const fs = require('fs');
const path = require('path');

const TEMPLATES = [
  '/data/data/com.termux/files/home/ai-lab-internal/products/ai-customer-support-agent/template.json',
  '/data/data/com.termux/files/home/ai-lab-internal/products/missed-call-sms/template.json',
];

const ALLOWED_NODE_TYPES = new Set([
  'n8n-nodes-base.webhook',
  'n8n-nodes-base.respondToWebhook',
  'n8n-nodes-base.set',
  'n8n-nodes-base.twilio',
  '@n8n/n8n-nodes-langchain.agent',
  '@n8n/n8n-nodes-langchain.lmChatOpenAi',
  '@n8n/n8n-nodes-langchain.memoryManager',
]);

const VALID_CONNECTION_TYPES = new Set(['main', 'ai_languageModel', 'ai_memory', 'ai_tool']);

const TRIGGER_TYPES = new Set(['n8n-nodes-base.webhook']);

function assert(condition, message) {
  if (!condition) return { pass: false, message };
  return { pass: true };
}

function validateStructure(template) {
  const issues = [];
  if (typeof template !== 'object' || template === null)
    issues.push('Root is not a valid JSON object');
  if (!template.name || typeof template.name !== 'string')
    issues.push('Missing or invalid "name" (must be a non-empty string)');
  if (!Array.isArray(template.nodes))
    issues.push('Missing or invalid "nodes" (must be an array)');
  if (!template.connections || typeof template.connections !== 'object' || Array.isArray(template.connections))
    issues.push('Missing or invalid "connections" (must be an object)');
  if (!template.settings || typeof template.settings !== 'object')
    issues.push('Missing or invalid "settings" (must be an object)');
  return { pass: issues.length === 0, message: issues.length ? issues.join('; ') : 'All structure fields present' };
}

function validateNodes(template) {
  const issues = [];
  const nodes = template.nodes;
  if (!nodes || !Array.isArray(nodes)) return { pass: false, message: 'nodes is not an array' };
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!n || typeof n !== 'object') {
      issues.push(`Node[${i}] is not a valid object`);
      continue;
    }
    if (!n.name || typeof n.name !== 'string') issues.push(`Node[${i}] missing or invalid "name"`);
    if (!n.type || typeof n.type !== 'string') issues.push(`Node[${i}] missing or invalid "type" (node: "${n.name || 'unnamed'}")`);
    if (n.typeVersion === undefined || n.typeVersion === null) issues.push(`Node "${n.name || i}" missing "typeVersion"`);
    if (!Array.isArray(n.position) || n.position.length !== 2) issues.push(`Node "${n.name || i}" missing or invalid "position"`);
    if (n.parameters === undefined || n.parameters === null || typeof n.parameters !== 'object') issues.push(`Node "${n.name || i}" missing or invalid "parameters"`);
  }
  return { pass: issues.length === 0, message: issues.length ? issues.join('; ') : `All ${nodes.length} nodes valid` };
}

function validateNodeTypes(template) {
  const issues = [];
  for (const n of template.nodes) {
    if (!n.type) continue;
    if (!ALLOWED_NODE_TYPES.has(n.type)) {
      issues.push(`Node "${n.name}" has unknown type "${n.type}"`);
    }
  }
  return { pass: issues.length === 0, message: issues.length ? issues.join('; ') : `All node types are known` };
}

function validateConnections(template) {
  const issues = [];
  const nodeNames = new Set(template.nodes.map(n => n.name));
  const conn = template.connections || {};

  for (const [sourceName, targets] of Object.entries(conn)) {
    if (!nodeNames.has(sourceName)) {
      issues.push(`Connection source "${sourceName}" does not match any node name`);
      continue;
    }
    if (typeof targets !== 'object' || targets === null || Array.isArray(targets)) {
      issues.push(`Connection for "${sourceName}" should be an object keyed by connection type`);
      continue;
    }
    for (const [connType, entries] of Object.entries(targets)) {
      if (!VALID_CONNECTION_TYPES.has(connType)) {
        issues.push(`Connection "${sourceName}" has unknown connection type "${connType}"`);
        continue;
      }
      if (!Array.isArray(entries)) {
        issues.push(`Connection "${sourceName}" -> "${connType}" should be an array of arrays`);
        continue;
      }
      for (let ei = 0; ei < entries.length; ei++) {
        const group = entries[ei];
        if (!Array.isArray(group)) {
          issues.push(`Connection "${sourceName}" -> "${connType}"[${ei}] should be an array`);
          continue;
        }
        for (let gi = 0; gi < group.length; gi++) {
          const link = group[gi];
          if (!link || typeof link !== 'object') {
            issues.push(`Connection "${sourceName}" -> "${connType}"[${ei}][${gi}] is not a valid link object`);
            continue;
          }
          if (!link.node || typeof link.node !== 'string') {
            issues.push(`Connection "${sourceName}" -> "${connType}"[${ei}][${gi}] missing or invalid "node"`);
          } else if (!nodeNames.has(link.node)) {
            issues.push(`Connection "${sourceName}" -> "${connType}" references unknown node "${link.node}"`);
          }
          if (!link.type || typeof link.type !== 'string') {
            issues.push(`Connection "${sourceName}" -> "${connType}"[${ei}][${gi}] missing or invalid "type"`);
          }
          if (link.index === undefined || link.index === null || typeof link.index !== 'number') {
            issues.push(`Connection "${sourceName}" -> "${connType}"[${ei}][${gi}] missing or invalid "index"`);
          }
        }
      }
    }
  }
  return { pass: issues.length === 0, message: issues.length ? issues.join('; ') : 'All connections valid' };
}

function validateConnectionGraph(template) {
  const issues = [];
  const nodeNames = new Set(template.nodes.map(n => n.name));
  const triggerNames = new Set(template.nodes.filter(n => TRIGGER_TYPES.has(n.type)).map(n => n.name));
  const conn = template.connections || {};
  const incomingCount = {};

  const connectedViaOnlyNonMain = {};
  const hasIncomingMain = {};

  for (const name of nodeNames) {
    incomingCount[name] = 0;
    connectedViaOnlyNonMain[name] = true;
    hasIncomingMain[name] = false;
  }

  for (const [sourceName, targets] of Object.entries(conn)) {
    for (const [connType, entries] of Object.entries(targets)) {
      if (!Array.isArray(entries)) continue;
      for (const group of entries) {
        if (!Array.isArray(group)) continue;
        for (const link of group) {
          if (link && link.node && incomingCount[link.node] !== undefined) {
            incomingCount[link.node]++;
            if (connType === 'main') {
              hasIncomingMain[link.node] = true;
            }
          }
        }
      }
    }
  }

  for (const name of nodeNames) {
    if (triggerNames.has(name)) continue;
    if (incomingCount[name] === 0) {
      const outgoingConns = conn[name];
      if (outgoingConns) {
        const connTypes = Object.keys(outgoingConns);
        const allNonMain = connTypes.every(t => t !== 'main');
        const noIncomingMain = !hasIncomingMain[name];
        if (allNonMain && noIncomingMain) continue;
      }
      issues.push(`Node "${name}" has no incoming connections (and is not a trigger node)`);
    }
  }

  for (const [sourceName, targets] of Object.entries(conn)) {
    for (const [connType, entries] of Object.entries(targets)) {
      if (!Array.isArray(entries)) continue;
      for (const group of entries) {
        if (!Array.isArray(group)) continue;
        for (const link of group) {
          if (link && link.node && link.type) {
            if (connType !== link.type) {
              issues.push(`Connection from "${sourceName}" has type "${connType}" but inner link specifies type "${link.type}"`);
            }
          }
        }
      }
    }
  }

  return { pass: issues.length === 0, message: issues.length ? issues.join('; ') : 'Connection graph is valid' };
}

const PARAM_RULES = {
  'n8n-nodes-base.webhook': [
    { key: 'httpMethod', msg: 'requires "httpMethod" parameter' },
    { key: 'path', msg: 'requires "path" parameter' },
  ],
  'n8n-nodes-base.respondToWebhook': [
    { key: 'respondWith', msg: 'requires "respondWith" parameter' },
    { key: 'responseBody', msg: 'requires "responseBody" parameter' },
  ],
  'n8n-nodes-base.set': [
    { key: 'values', msg: 'requires "values" parameter' },
  ],
  'n8n-nodes-base.twilio': [
    { key: 'operation', msg: 'requires "operation" parameter' },
    { key: 'fromNumber', msg: 'requires "fromNumber" parameter' },
    { key: 'toNumber', msg: 'requires "toNumber" parameter' },
    { key: 'message', msg: 'requires "message" parameter' },
  ],
  '@n8n/n8n-nodes-langchain.agent': [
    { key: 'agent', msg: 'requires "agent" parameter with agentType and systemMessage' },
  ],
  '@n8n/n8n-nodes-langchain.lmChatOpenAi': [
    { key: 'model', msg: 'requires "model" parameter' },
    { key: 'temperature', msg: 'requires "temperature" parameter' },
  ],
  '@n8n/n8n-nodes-langchain.memoryManager': [
    { key: 'memoryType', msg: 'requires "memoryType" parameter' },
  ],
};

function validateParameters(template) {
  const issues = [];
  for (const n of template.nodes) {
    const rules = PARAM_RULES[n.type];
    if (!rules) continue;
    for (const rule of rules) {
      const parts = rule.key.split('.');
      let val = n.parameters;
      for (const p of parts) {
        if (val === undefined || val === null || typeof val !== 'object') break;
        val = val[p];
      }
      if (val === undefined || val === null) {
        issues.push(`Node "${n.name}" (${n.type}) ${rule.msg}`);
      }
    }

    if (n.type === '@n8n/n8n-nodes-langchain.agent' && n.parameters && n.parameters.agent) {
      const agent = n.parameters.agent;
      if (!agent.agentType) issues.push(`Node "${n.name}" agent parameter missing "agentType"`);
      if (!agent.systemMessage) issues.push(`Node "${n.name}" agent parameter missing "systemMessage"`);
    }
  }
  return { pass: issues.length === 0, message: issues.length ? issues.join('; ') : 'All required parameters present' };
}

function validateFile(filePath) {
  const label = path.basename(path.dirname(filePath)) + '/' + path.basename(filePath);
  const name = path.basename(path.dirname(filePath));
  console.log(`\n${'='.repeat(70)}`);
  console.log(`TEMPLATE: ${label}`);
  console.log(`${'='.repeat(70)}`);

  let template;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    template = JSON.parse(raw);
    console.log(`  PARSE: PASS (${(raw.length / 1024).toFixed(1)} KB, ${template.nodes ? template.nodes.length : 0} nodes)`);
  } catch (err) {
    console.log(`  PARSE: FAIL - ${err.message}`);
    console.log(`\n  OVERALL: FAIL`);
    return;
  }

  const checks = [
    ['Structure', validateStructure(template)],
    ['Nodes', validateNodes(template)],
    ['Node Types', validateNodeTypes(template)],
    ['Connections', validateConnections(template)],
    ['Connection Graph', validateConnectionGraph(template)],
    ['Parameters', validateParameters(template)],
  ];

  let allPass = true;
  for (const [label, result] of checks) {
    const status = result.pass ? 'PASS' : 'FAIL';
    if (!result.pass) allPass = false;
    console.log(`  ${label}: ${status}`);
    if (result.message && !result.pass) {
      console.log(`         ${result.message}`);
    }
    if (result.pass && result.message) {
      console.log(`         ${result.message}`);
    }
  }

  console.log(`\n  OVERALL: ${allPass ? 'PASS' : 'FAIL'}`);
}

console.log('n8n Workflow Template Validator');
console.log('='.repeat(70));

for (const fp of TEMPLATES) {
  if (!fs.existsSync(fp)) {
    console.log(`\n  FILE NOT FOUND: ${fp}`);
    continue;
  }
  validateFile(fp);
}

console.log(`\n${'='.repeat(70)}`);
console.log('Validation complete.');
