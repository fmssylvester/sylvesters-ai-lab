const https = require('https');
const path = require('path');
try { require('dotenv').config({ path: path.join(__dirname, '..', 'pipeline', '.env') }); } catch(e) {}

const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
  console.error("GEMINI_API_KEY not set. Check pipeline/.env");
  process.exit(1);
}

function askGemini(systemPrompt, userMessage) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{
        role: "user",
        parts: [{ text: systemPrompt + "\n\n---\n\n" + userMessage }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    });

    const req = https.request({
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try {
          const j = JSON.parse(data);
          const text = j.candidates?.[0]?.content?.parts?.[0]?.text || "NO RESPONSE: " + JSON.stringify(j);
          resolve(text);
        } catch(e) { reject(e.message + "\n" + data); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  console.log("=" .repeat(70));
  console.log("PRODUCT 1: AI Customer Support Agent");
  console.log("=" .repeat(70));

  const customerSupportPrompt = "You are a professional, friendly customer support agent for a SaaS company. Your name is 'SupportAI'.\n\n## Core Rules\n- Be helpful, concise, and empathetic\n- Never make up information you don't know\n- If you need more details, ask clarifying questions\n- Always maintain a professional tone\n- If a customer is frustrated, acknowledge their frustration first\n\n## When to Escalate\nIf the customer asks about:\n- Account deletion or data privacy requests\n- Billing disputes or refunds\n- Security concerns or suspected account breaches\n- Anything requiring human judgment or policy exceptions\n\nRespond with: ESCALATE: [reason] and I will guide them on next steps.\n\n## Response Format\nKeep responses under 150 words unless complex. Use clear sections for multi-part answers.\n\n## Available Information\nYou are a first-line support agent. You can:\n- Answer common questions about product features\n- Help with troubleshooting basic issues\n- Guide users to relevant documentation\n- Collect information for escalation\n\nRemember: You represent the company. Be professional, helpful, and honest.";

  const testCases1 = [
    { label: "Basic product question", msg: "Hi, I'm trying to export my data but I can't find the export button. Where is it?" },
    { label: "Frustrated customer", msg: "Your service is terrible! I've been charged twice this month and can't get through to anyone!!" },
    { label: "Escalation needed", msg: "I need to delete my account and all my personal data please." },
  ];

  for (const tc of testCases1) {
    console.log(`\n--- Test: ${tc.label} ---`);
    console.log("User:", tc.msg);
    try {
      const reply = await askGemini(customerSupportPrompt, tc.msg);
      console.log("SupportAI:", reply.slice(0, 400));
    } catch(e) { console.log("ERROR:", e); }
  }

  console.log("\n" + "=" .repeat(70));
  console.log("PRODUCT 2: Missed Call SMS Text-Back");
  console.log("=" .repeat(70));

  const smsPromptTmpl = "You are an automated SMS assistant for $BUSINESS. A customer just called and missed reaching someone. Your ONLY job is to generate a friendly SMS reply that:\n\n1. Greets the customer by name if available (use 'there' if unknown)\n2. Apologizes for missing their call\n3. Explains they can reply to this message to book an appointment or ask a question\n4. Keeps the tone warm and professional\n\nThe response should be a single SMS (under 160 characters if possible).\n\nCustomer info: called at $TIME";

  const testCases2 = [
    { label: "Dentist office missed call", prompt: smsPromptTmpl.replace("$BUSINESS", "Bright Smile Dental").replace("$TIME", "2026-07-25T10:30:00Z") },
    { label: "Hair salon missed call", prompt: smsPromptTmpl.replace("$BUSINESS", "Luxe Cuts Salon").replace("$TIME", "2026-07-25T14:15:00Z") },
  ];

  for (const tc of testCases2) {
    console.log(`\n--- Test: ${tc.label} ---`);
    console.log("Scenario:", tc.label);
    try {
      const reply = await askGemini(tc.prompt, "Generate the SMS now.");
      console.log("Generated SMS:", reply.slice(0, 300));
    } catch(e) { console.log("ERROR:", e); }
  }

  console.log("\n" + "=" .repeat(70));
  console.log("DONE - Templates tested successfully");
  console.log("=" .repeat(70));
}

run().catch(console.error);
