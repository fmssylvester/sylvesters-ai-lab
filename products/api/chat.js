module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(204).end('')
  if (req.method !== 'POST') return res.status(405).end('')

  try {
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}')

    if (body.email && body.name) {
      return res.json({ success: true, message: "Thanks! We'll send the walkthrough soon." })
    }

    const msg = body.message || ''
    const convId = body.conversationId || 'default'
    const product = body.product || 'cs-agent'
    const channel = body.channel || ''

    let system
    if (product === 'multi-channel') {
      const guides = {
        whatsapp: 'Professional but friendly. Use emojis sparingly. Keep responses under 300 chars. Sign with "— [Business Name]".',
        telegram: 'Casual and concise. Supports markdown formatting. Can use bullet points.',
        sms: 'Very short (under 160 chars). No formatting. Clear and direct. Sign with business name.'
      }
      system = `You are a multi-channel communication hub demo. The user is on ${channel || 'WhatsApp'}. ${guides[channel] || guides.whatsapp} Keep responses under 80 words and demonstrate channel-appropriate formatting.`
    } else {
      system = `You are SupportAI, a demo assistant for the ${product} n8n workflow template. Keep responses under 80 words and conversational.`
    }

    const aiResp = await callNvidia(system, msg)

    res.json({
      success: true,
      response: aiResp,
      conversationId: convId,
      timestamp: new Date().toISOString()
    })
  } catch (e) {
    res.json({
      success: true,
      response: "Hi! I'm the demo assistant. This template lets you automate customer support with AI. Check the workflow diagram above to see how it works.",
      conversationId: req.body?.conversationId || '?',
      timestamp: new Date().toISOString()
    })
  }
}

async function callNvidia(system, userMsg) {
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
        { role: 'user', content: userMsg }
      ],
      max_tokens: 200,
      temperature: 0.7
    }),
    signal: AbortSignal.timeout(25000)
  })
  if (!resp.ok) throw new Error(`NVIDIA ${resp.status}`)
  const data = await resp.json()
  return data.choices[0].message.content
}
