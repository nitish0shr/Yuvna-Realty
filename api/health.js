// Vercel Serverless Function - Health Check

export default function handler(req, res) {
  // Check which AI providers are configured
  const providers = {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_API_KEY,
  };

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    providers,
  });
}

