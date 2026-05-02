import { KeyRound, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { resetPasswordApi } from '@/lib/auth';
import { setPageSeo } from '@/lib/seo';
import { toast } from 'sonner';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const email = params.get('email') ?? '';
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPageSeo('Set new password · BanglarChaka', 'Choose a new password for your account.');
  }, []);

  useEffect(() => {
    if (!token || !email) {
      toast.error('Invalid or incomplete reset link. Request a new one from Forgot password.');
    }
  }, [token, email]);

  const submit = async () => {
    if (!token || !email) return;
    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const res = await resetPasswordApi({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      toast.success(res.message);
      setPassword('');
      setPasswordConfirmation('');
      setTimeout(() => navigate('/login', { replace: true }), 800);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = Boolean(token && email && password.length >= 8 && passwordConfirmation.length >= 1);

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#233D7B_0%,_transparent_58%)] opacity-[0.12]" aria-hidden />

      <div className="relative max-w-lg mx-auto px-4 py-14 sm:py-20">
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 p-8 sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-6">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-[1.65rem] font-bold text-slate-900 tracking-tight">Set a new password</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {email ? (
              <>
                For <span className="font-medium text-slate-800">{email}</span>
              </>
            ) : (
              'Open this page from the link in your email so the reset token is included.'
            )}
          </p>

          {!token || !email ? (
            <p className="mt-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-sm px-4 py-3">
              This link looks incomplete.{' '}
              <Link to="/forgot-password" className="font-semibold underline">
                Request a new reset email
              </Link>
              .
            </p>
          ) : (
            <>
              <div className="mt-8 space-y-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">New password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[15px] outline-none ring-[#233D7B]/40 focus:bg-white focus:ring-2"
                    autoComplete="new-password"
                    disabled={busy}
                  />
                  <span className="mt-1 block text-xs text-slate-500">Minimum 8 characters, mix of letters and numbers recommended.</span>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirm password</span>
                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[15px] outline-none ring-[#233D7B]/40 focus:bg-white focus:ring-2"
                    autoComplete="new-password"
                    disabled={busy}
                  />
                </label>
              </div>

              <button
                type="button"
                disabled={busy || !canSubmit}
                onClick={() => void submit()}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-[#C4161C] text-white py-3.5 text-[15px] font-semibold shadow-md hover:bg-red-800 disabled:opacity-50 disabled:pointer-events-none transition"
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Update password
              </button>
            </>
          )}

          <p className="mt-10 text-center text-sm text-slate-500">
            <Link to="/login" className="font-semibold text-[#233D7B] hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
