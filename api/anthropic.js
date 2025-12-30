// Vercel Serverless Function - Anthropic (Claude) API Proxy

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return res.status(400).json({ error: 'Anthropic API key not configured' });
  }

  try {
    const { messages, jsonMode, temperature } = req.body;

    // Extract system message and convert to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        temperature: temperature || 0.7,
        system: systemMessage + (jsonMode ? '\n\nIMPORTANT: Respond with valid JSON only. No additional text.' : ''),
        messages: userMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Anthropic API error:', error);
      return res.status(response.status).json({ 
        error: error.error?.message || 'Anthropic API error' 
      });
    }

    const data = await response.json();
    let content = data.content[0].text;

    // Strip markdown code blocks if present
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    res.status(200).json({ content });
  } catch (error) {
    console.error('Anthropic error:', error);
    res.status(500).json({ error: error.message });
  }
}

