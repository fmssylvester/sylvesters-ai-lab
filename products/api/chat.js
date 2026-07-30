export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(204).end('')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const chunks = []
  req.on('data', c => chunks.push(c))
  req.on('end', async () => {
    try {
      const body = JSON.parse(Buffer.concat(chunks).toString())

      if (body.email && body.name) {
        return res.json({ success: true, message: "Thanks! Walkthrough coming soon." })
      }

      const msg = body.message || ''
      const convId = body.conversationId || 'default'
      const product = body.product || 'cs-agent'

      const redirectUrl = product === 'ai-agent'
        ? 'https://sylvesterlab.gumroad.com/l/ai-agent-n8n'
        : 'https://sylvesterlab.gumroad.com/l/ai-customer-support-pro'

      const system = product === 'ai-agent'
        ? 'You are an AI agent...'
        : 'You are SupportAI...'

      const aiResp = await callNvidia(system, msg)

      res.json({
        success: true,
        response: aiResp,
        conversationId: convId,
        timestamp: new Date().toISOString()
      })
    } catch (e) {
      res.json({ success: true, response: 'Service unavailable. Please try again.', conversationId: body?.conversationId || '?' })
    }
  })
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
      max_tokens: 300,
      temperature: 0.7
    }),
    signal: AbortSignal.timeout(25000)
  })
  if (!resp.ok) throw new Error(`NVIDIA ${resp.status}`)
  const data = await resp.json()
  return data.choices[0].message.content
}
