import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { YuvnaLogoCompact } from './YuvnaLogo';

interface JuvnaLoginProps {
  onSkip?: () => void;
}

export function JuvnaLogin({ onSkip }: JuvnaLoginProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send login link');
      }

      setIsSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F9F7F5] to-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#3D2D22] mb-3">
            Check Your Email
          </h1>
          <p className="text-[#7a6a5f] mb-6">
            We've sent a magic link to <strong>{email}</strong>. Click the link to sign in.
          </p>
          <button
            onClick={() => setIsSent(false)}
            className="text-[#E07F26] hover:underline text-sm"
          >
            Use a different email
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F7F5] to-white flex flex-col">
      {/* Header */}
      <header className="p-6">
        <YuvnaLogoCompact />
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-[#3D2D22] mb-3">
              Welcome to Yuvna Realty
            </h1>
            <p className="text-[#7a6a5f]">
              Sign in to save your preferences and get personalized recommendations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#7a6a5f] mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a6a5f]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-[#E8E4E0] text-[#3D2D22] placeholder:text-[#9a8a7f] focus:outline-none focus:border-[#E07F26] text-lg"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full py-4 rounded-xl bg-[#E07F26] text-white font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#c96e1f] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Magic Link
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {onSkip && (
            <div className="mt-6 text-center">
              <button
                onClick={onSkip}
                className="text-[#7a6a5f] hover:text-[#3D2D22] text-sm transition-colors"
              >
                Continue without signing in →
              </button>
            </div>
          )}

          <div className="mt-8 p-4 rounded-xl bg-[#F9F7F5] border border-[#E8E4E0]">
            <h3 className="font-semibold text-[#3D2D22] mb-2">Why sign in?</h3>
            <ul className="text-sm text-[#7a6a5f] space-y-1">
              <li>• Save your property preferences</li>
              <li>• Get personalized recommendations</li>
              <li>• Track your ROI calculations</li>
              <li>• Resume conversations anytime</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

