const AGENT_SYSTEM_PROMPT = `You are an intelligent AI agent with memory and tools — a LIVE INTERACTIVE DEMO of the "AI Agent with Memory & Tools" n8n workflow template.

## YOUR CONTEXT
- You ARE the product being demonstrated. This is an n8n workflow template.
- The template has 7 connected nodes: Webhook → AI Agent → OpenAI Chat Model → Window Buffer Memory (20 msg) → Calculator Tool → Wikipedia Tool → Webhook Response
- It imports into n8n in 1 click. Setup takes ~5 minutes.
- Requires only an OpenAI API key. Calculator and Wikipedia tools need no extra keys.
- Sold on Gumroad for $29 (Essentials), $69 (Professional), $149 (Enterprise).
- Gumroad URL: sylvesterlab.gumroad.com/l/ai-agent-n8n

## YOUR CAPABILITIES (as the demo)
- You can do math, answer factual questions, and have conversations
- When asked a calculation: show the result with a brief explanation
- When asked about facts/history/science: give a concise answer
- Use **bold** for numbers and key facts in your responses

## TRIAL AWARENESS
- User gets 5 free messages
- If asked about pricing: "$29 one-time for Essentials, $69 Professional, $149 Enterprise"
- If asked where to buy: "sylvesterlab.gumroad.com/l/ai-agent-n8n"`

const SYSTEM_PROMPT = `You are SupportAI — a LIVE INTERACTIVE DEMO of the AI Customer Support Agent n8n workflow template.

## YOUR CONTEXT
- You ARE the product being demonstrated. This is an n8n workflow template.
- The template handles customer inquiries with AI, remembers 10 messages of context, escalates complex issues to humans, and integrates via webhook.
- It uses GPT-5-mini (or your choice of model) and costs ~$0.002 per conversation to run.
- It imports into n8n in 1 click. Setup takes ~5 minutes.
- Sold on Gumroad for $29 one-time. URL: sylvesterlab.gumroad.com/l/ai-customer-support-pro

## TRIAL AWARENESS
- User gets 5 free messages
- If asked about pricing: "$29 one-time, no subscription."
- If asked where to buy: "sylvesterlab.gumroad.com/l/ai-customer-support-pro"`

const MAX_TRIAL = 5
const conversations = {}
const convMsgCount = {}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body || {}

  // Lead capture
  if (body.email && body.name) {
    return res.json({ success: true, message: "Thanks! Walkthrough coming soon." })
  }

  const msg = body.message || ''
  const convId = body.conversationId || 'default'
  const product = body.product || 'cs-agent'

  convMsgCount[convId] = (convMsgCount[convId] || 0) + 1

  const redirectUrl = product === 'ai-agent'
    ? 'https://sylvesterlab.gumroad.com/l/ai-agent-n8n'
    : 'https://sylvesterlab.gumroad.com/l/ai-customer-support-pro'

  if (convMsgCount[convId] >= MAX_TRIAL) {
    return res.json({ success: true, trial_over: true, redirect: redirectUrl, conversationId: convId })
  }

  if (!conversations[convId]) conversations[convId] = []
  conversations[convId].push({ role: 'user', content: msg })
  if (conversations[convId].length > 20) conversations[convId] = conversations[convId].slice(-20)

  try {
    const system = product === 'ai-agent' ? AGENT_SYSTEM_PROMPT : SYSTEM_PROMPT
    const aiResp = await callAI(system, conversations[convId])

    conversations[convId].push({ role: 'assistant', content: aiResp })

    res.json({
      success: true,
      response: aiResp,
      conversationId: convId,
      timestamp: new Date().toISOString()
    })
  } catch (e) {
    res.json({
      success: true,
      response: "I apologize, I'm having a temporary issue. Please try again in a moment.",
      conversationId: convId
    })
  }
}

async function callAI(system, messages) {
  const last6 = messages.slice(-6)
  const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`
    },
    body: JSON.stringify({
      model: 'nvidia/nemotron-3-nano-30b-a3b',
      messages: [
        { role: 'system', content: system },
        ...last6
      ],
      max_tokens: 300,
      temperature: 0.7
    }),
    signal: AbortSignal.timeout(25000)
  })

  if (!resp.ok) throw new Error(`NVIDIA API: ${resp.status}`)

  const data = await resp.json()
  return data.choices[0].message.content
}
