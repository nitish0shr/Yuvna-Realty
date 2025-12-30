// Vercel Serverless Function - Google Gemini API Proxy

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(400).json({ error: 'Gemini API key not configured' });
  }

  try {
    const { messages, jsonMode, temperature } = req.body;

    // Convert messages to Gemini format
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const contents = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Prepend system as user message if present
    if (systemMessage) {
      contents.unshift({
        role: 'user',
        parts: [{ text: `System Instructions:\n${systemMessage}${jsonMode ? '\n\nIMPORTANT: Respond with valid JSON only.' : ''}` }],
      });
      contents.splice(1, 0, {
        role: 'model',
        parts: [{ text: 'Understood. I will follow these instructions.' }],
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: temperature || 0.7,
            maxOutputTokens: 4096,
            ...(jsonMode && { responseMimeType: 'application/json' }),
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API error:', error);
      return res.status(response.status).json({ 
        error: error.error?.message || 'Gemini API error' 
      });
    }

    const data = await response.json();
    res.status(200).json({ content: data.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: error.message });
  }
}

