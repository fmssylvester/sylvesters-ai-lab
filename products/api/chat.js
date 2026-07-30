module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(204).end('')
  if (req.method !== 'POST') return res.status(405).end('')

  try {
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}')

    if (body.email && body.name) {
      return res.json({ success: true, message: "Thanks!" })
    }

    const msg = body.message || ''
    const convId = body.conversationId || 'default'
    const product = body.product || 'cs-agent'

    const system = `You are a helpful assistant for the ${product} n8n workflow template.`

    const aiResp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-nano-30b-a3b',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: msg }
        ],
        max_tokens: 300,
        temperature: 0.7
      }),
      signal: AbortSignal.timeout(25000)
    })

    if (!aiResp.ok) throw new Error(`NVIDIA ${aiResp.status}`)

    const data = await aiResp.json()

    res.json({
      success: true,
      response: data.choices[0].message.content,
      conversationId: convId,
      timestamp: new Date().toISOString()
    })
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack?.split('\n').slice(0,3).join(' ') })
  }
}
