import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { YuvnaLogoCompact } from './YuvnaLogo';
import { useAuth } from '../../context/AuthContext';

interface JuvnaAdminLoginProps {
  onBack: () => void;
}

export function JuvnaAdminLogin({ onBack }: JuvnaAdminLoginProps) {
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);

    const result = await signInWithPassword(email.trim(), password.trim());
    if (!result.success) {
      setError(result.error || 'Unable to sign in.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F7F5] to-white flex flex-col">
      <header className="p-6 flex items-center justify-between">
        <YuvnaLogoCompact />
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[#7a6a5f] hover:text-[#3D2D22] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to site
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#E07F26]/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-[#E07F26]" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#3D2D22] mb-3">
              Admin Access Required
            </h1>
            <p className="text-[#7a6a5f]">
              Sign in with your administrator credentials to access the agent portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#7a6a5f] mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a6a5f]" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@yuvna.com"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-[#E8E4E0] text-[#3D2D22] placeholder:text-[#9a8a7f] focus:outline-none focus:border-[#E07F26] text-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#7a6a5f] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a6a5f]" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
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
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full py-4 rounded-xl bg-[#E07F26] text-white font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#c96e1f] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Access Agent Portal
                  <ShieldCheck className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-[#F9F7F5] border border-[#E8E4E0] text-sm text-[#7a6a5f]">
            This area contains internal lead data and outreach tools intended for administrators only.
          </div>
        </motion.div>
      </main>
    </div>
  );
}
