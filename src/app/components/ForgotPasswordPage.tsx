import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { requestPasswordReset } from '@/lib/auth';
import { setPageSeo } from '@/lib/seo';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPageSeo('Forgot password · BanglarChaka', 'Reset your BanglarChaka account password.');
  }, []);

  const submit = async () => {
    setBusy(true);
    try {
      const res = await requestPasswordReset(email.trim());
      toast.success(res.message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#233D7B_0%,_transparent_58%)] opacity-[0.12]" aria-hidden />

      <div className="relative max-w-lg mx-auto px-4 py-14 sm:py-20">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#233D7B] hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>

        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 p-8 sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#233D7B]/10 text-[#233D7B] mb-6">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-[1.65rem] font-bold text-slate-900 tracking-tight">Forgot password</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Enter your account email and we will send you a secure link to choose a new password.
          </p>

          <div className="mt-8 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition ring-[#233D7B]/40 focus:bg-white focus:ring-2"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={busy}
              />
            </label>
          </div>

          <button
            type="button"
            disabled={busy || !email.trim()}
            onClick={() => void submit()}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-[#233D7B] text-white py-3.5 text-[15px] font-semibold shadow-md shadow-[#233D7B]/20 hover:bg-[#1a2f5e] disabled:opacity-50 disabled:pointer-events-none transition"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Send reset link
          </button>

          <p className="mt-8 text-center text-sm text-slate-500">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-[#233D7B] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
