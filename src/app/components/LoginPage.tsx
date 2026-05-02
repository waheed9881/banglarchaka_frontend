import { GoogleLogin } from '@react-oauth/google';
import { Car, Check, ChevronDown, Loader2, Smartphone, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { fetchMe, loginWithEmailPassword, loginWithGoogleIdToken, registerBuyer, logoutLocal } from '@/lib/auth';
import { loginWithPhoneOtp, sendLoginOtp } from '@/lib/engagement';
import { setPageSeo } from '@/lib/seo';
import { toast } from 'sonner';

const googleClientId =
  typeof import.meta.env.VITE_GOOGLE_CLIENT_ID === 'string' ? import.meta.env.VITE_GOOGLE_CLIENT_ID.trim() : '';

type Tab = 'login' | 'register';

export function LoginPage({ variant }: { variant: Tab }) {
  const navigate = useNavigate();
  const [me, setMe] = useState<{ id: number; name: string; email: string } | null>(null);
  const [tab, setTab] = useState<Tab>(variant);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpHint, setOtpHint] = useState('');
  const [otpSendBusy, setOtpSendBusy] = useState(false);
  const [otpVerifyBusy, setOtpVerifyBusy] = useState(false);
  const [otpDelivered, setOtpDelivered] = useState(false);
  const [otpResendSec, setOtpResendSec] = useState(0);
  const [submittingLogin, setSubmittingLogin] = useState(false);
  const [submittingRegister, setSubmittingRegister] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    setTab(variant);
  }, [variant]);

  useEffect(() => {
    setPageSeo(
      variant === 'register' ? 'Create account · BanglarChaka' : 'Sign in · BanglarChaka',
      'Join BanglarChaka to manage listings, messages, wishlists, and dealer tools.',
    );
  }, [variant]);

  useEffect(() => {
    fetchMe().then((u) => {
      setMe(u);
      if (u) navigate('/', { replace: true });
    });
  }, [navigate]);

  const doLogin = async () => {
    setSubmittingLogin(true);
    try {
      const data = await loginWithEmailPassword(email.trim(), password);
      const meFresh = await fetchMe();
      setMe(meFresh || data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setSubmittingLogin(false);
    }
  };

  const doRegister = async () => {
    if (regPassword !== regPassword2) {
      toast.error('Passwords do not match.');
      return;
    }
    setSubmittingRegister(true);
    try {
      const data = await registerBuyer({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        password_confirmation: regPassword2,
        phone: regPhone.trim() || undefined,
      });
      const meFresh = await fetchMe();
      setMe(meFresh || data.user);
      toast.success('Account created!');
      navigate('/');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setSubmittingRegister(false);
    }
  };

  useEffect(() => {
    if (otpResendSec <= 0) return;
    const id = window.setTimeout(() => setOtpResendSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [otpResendSec]);

  const doSendOtp = async () => {
    const p = otpPhone.trim();
    if (!p) {
      toast.error('Enter your mobile number.');
      return;
    }
    setOtpSendBusy(true);
    try {
      const res = await sendLoginOtp(p);
      setOtpHint(res.debugCode ? `Dev OTP: ${res.debugCode}` : '');
      setOtpDelivered(true);
      setOtpResendSec(45);
      toast.success(res.debugCode ? `Dev code: ${res.debugCode}` : 'Verification code sent.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'OTP send failed');
    } finally {
      setOtpSendBusy(false);
    }
  };

  const doOtpLogin = async () => {
    const p = otpPhone.trim();
    if (!p || !otpCode.trim()) {
      toast.error('Enter your phone number and the code we sent.');
      return;
    }
    setOtpVerifyBusy(true);
    try {
      await loginWithPhoneOtp(p, otpCode.trim());
      const meFresh = await fetchMe();
      setMe(meFresh);
      setOtpCode('');
      setOtpHint('');
      setOtpDelivered(false);
      setOtpResendSec(0);
      toast.success('Signed in');
      navigate('/');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'OTP login failed');
    } finally {
      setOtpVerifyBusy(false);
    }
  };

  if (me) {
    return null;
  }

  const tabBtn = (active: boolean) =>
    `flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${
      active ? 'bg-white text-[#233D7B] shadow-sm' : 'text-white/80 hover:text-white'
    }`;

  return (
    <div className="relative min-h-[calc(100vh-6rem)] overflow-hidden bg-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,#233D7B_0%,transparent_55%)] opacity-20" aria-hidden />

      <div className="relative max-w-5xl mx-auto px-4 py-10 sm:py-16">
        <div className="flex flex-col lg:flex-row rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10">
          {/* Brand panel */}
          <div className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-gradient-to-br from-[#233D7B] via-[#1f3770] to-[#152a57] text-white p-10 xl:p-12">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                  <Car className="w-6 h-6" />
                </div>
                <span className="text-lg font-bold tracking-tight">BanglarChaka</span>
              </div>
              <h2 className="text-2xl xl:text-3xl font-bold leading-tight tracking-tight">
                Cars, bikes & parts — one account for everything.
              </h2>
              <p className="mt-4 text-sm text-white/85 leading-relaxed max-w-sm">
                Save searches, message sellers, manage your listings, and access dealer tools from a single secure
                dashboard.
              </p>
            </div>
            <div className="flex items-start gap-3 mt-10 text-xs text-white/75">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <p>We never post on your behalf. Google only shares your basic profile when you choose that option.</p>
            </div>
          </div>

          {/* Forms */}
          <div className="flex-1 p-6 sm:p-10 xl:p-12">
            <div className="lg:hidden mb-8 text-center">
              <h2 className="text-xl font-bold text-slate-900">BanglarChaka</h2>
              <p className="text-sm text-slate-600 mt-1">Sign in or create your account</p>
            </div>

            <div className="flex p-1 rounded-xl bg-[#233D7B] mb-8 max-w-md mx-auto lg:mx-0">
              <Link to="/login" className={`${tabBtn(tab === 'login')} text-center block`}>
                Sign in
              </Link>
              <Link to="/register" className={`${tabBtn(tab === 'register')} text-center block`}>
                Register
              </Link>
            </div>

            {tab === 'login' ? (
              <div className="space-y-6 max-w-md mx-auto lg:mx-0">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">Continue with Google</p>
                  {googleClientId ? (
                    <div className="flex justify-center [&_iframe]:max-h-[44px]" data-busy={googleBusy ? '1' : undefined}>
                      <GoogleLogin
                        onSuccess={async (cred) => {
                          if (!cred.credential) return;
                          setGoogleBusy(true);
                          try {
                            await loginWithGoogleIdToken(cred.credential);
                            await fetchMe();
                            toast.success('Signed in with Google');
                            navigate('/');
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : 'Google sign-in failed');
                          } finally {
                            setGoogleBusy(false);
                          }
                        }}
                        onError={() => toast.error('Google sign-in failed')}
                        text="continue_with"
                        shape="pill"
                        size="large"
                        theme="outline"
                        width="320"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl bg-amber-50 border border-amber-200/80 px-4 py-3 text-xs text-amber-950 leading-relaxed">
                      Add <code className="font-mono bg-amber-100/80 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> to your
                      frontend env and <code className="font-mono bg-amber-100/80 px-1 rounded">GOOGLE_CLIENT_ID</code>{' '}
                      (same Web client ID) on the Laravel API so Google sign-in can complete.
                    </div>
                  )}
                  {googleBusy ? (
                    <p className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Completing sign-in…
                    </p>
                  ) : null}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                    <span className="bg-white px-3">Or email</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px] outline-none ring-[#233D7B]/30 focus:bg-white focus:ring-2"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </label>
                  <div className="flex items-start justify-between gap-2">
                    <label className="block flex-1 min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</span>
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px] outline-none ring-[#233D7B]/30 focus:bg-white focus:ring-2"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void doLogin();
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-sm font-medium text-[#233D7B] hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <button
                    type="button"
                    disabled={submittingLogin}
                    onClick={() => void doLogin()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#233D7B] text-white py-3.5 text-[15px] font-semibold shadow-lg shadow-[#233D7B]/25 hover:bg-[#1a2f5e] disabled:opacity-60 transition"
                  >
                    {submittingLogin ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    Sign in
                  </button>
                </div>

                <details className="group rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/90 to-white shadow-sm overflow-hidden [&[open]]:ring-2 [&[open]]:ring-[#233D7B]/15 [&[open]]:border-[#233D7B]/25">
                  <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden px-4 py-4 sm:px-5 sm:py-4 flex items-center gap-3 sm:gap-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#233D7B]/10 text-[#233D7B]">
                      <Smartphone className="w-5 h-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-semibold text-slate-900">Sign in with phone</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        We&apos;ll text a one-time code. Use the number registered on your BanglarChaka account.
                      </p>
                    </div>
                    <ChevronDown className="w-5 h-5 shrink-0 text-slate-400 group-open:rotate-180 transition-transform duration-200" aria-hidden />
                  </summary>

                  <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-slate-100/90">
                    {/* Step rail */}
                    <div className="flex items-center gap-2 pt-5 pb-4" role="presentation">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          otpDelivered ? 'bg-emerald-600 text-white' : 'bg-[#233D7B] text-white'
                        }`}
                        aria-current={otpDelivered ? undefined : 'step'}
                      >
                        {otpDelivered ? <Check className="w-4 h-4" strokeWidth={2.6} aria-hidden /> : '1'}
                      </div>
                      <div className="h-px flex-1 min-w-[1rem] bg-slate-200" />
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          otpDelivered ? 'bg-[#233D7B] text-white ring-4 ring-[#233D7B]/10' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        2
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 -mt-1 mb-4 flex gap-4 justify-between px-1">
                      <span>Mobile number</span>
                      <span>Enter code</span>
                    </p>

                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mobile</span>
                        <input
                          value={otpPhone}
                          onChange={(e) => {
                            setOtpPhone(e.target.value);
                            setOtpDelivered(false);
                            setOtpHint('');
                            setOtpResendSec(0);
                          }}
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] tabular-nums outline-none ring-[#233D7B]/25 focus:ring-2 placeholder:text-slate-400"
                          placeholder="+880 1XXXXXXXXX"
                          inputMode="tel"
                          autoComplete="tel"
                          name="otp-phone-signin"
                        />
                        <span className="mt-1.5 block text-[11px] text-slate-500 leading-relaxed">
                          International format recommended (e.g. <span className="tabular-nums">+880 1XXXXXXXXX</span>).
                        </span>
                      </label>

                      <button
                        type="button"
                        disabled={otpSendBusy || otpResendSec > 0}
                        onClick={() => void doSendOtp()}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-[#233D7B]/25 bg-[#233D7B]/8 text-[#233D7B] py-3 text-sm font-semibold hover:bg-[#233D7B]/12 disabled:opacity-50 disabled:pointer-events-none transition"
                      >
                        {otpSendBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {otpResendSec > 0 ? `Resend code in ${otpResendSec}s` : otpDelivered ? 'Resend code' : 'Send verification code'}
                      </button>

                      <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4">
                        <label className="block">
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            One-time code
                          </span>
                          <input
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-center text-lg font-mono tracking-[0.4em] text-slate-900 outline-none ring-[#C4161C]/20 focus:ring-2"
                            placeholder="••••••"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={8}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') void doOtpLogin();
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          disabled={otpVerifyBusy}
                          onClick={() => void doOtpLogin()}
                          className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[#C4161C] text-white py-3.5 text-[15px] font-semibold shadow-md shadow-[#C4161C]/20 hover:bg-red-800 disabled:opacity-60 transition"
                        >
                          {otpVerifyBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                          Verify & sign in
                        </button>
                      </div>

                      {otpHint ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-3 text-xs text-amber-950 tabular-nums">
                          <p className="font-semibold text-amber-900 mb-1">Development mode</p>
                          <p>{otpHint}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </details>
              </div>
            ) : (
              <div className="space-y-4 max-w-md mx-auto lg:mx-0">
                <p className="text-sm text-slate-600 mb-2">
                  Create a buyer account instantly. Dealer upgrades are available after you sign in.
                </p>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full name</span>
                  <input
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px] outline-none focus:bg-white focus:ring-2 ring-[#233D7B]/30"
                    autoComplete="name"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px] outline-none focus:bg-white focus:ring-2 ring-[#233D7B]/30"
                    autoComplete="email"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone (optional)</span>
                  <input
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px] outline-none focus:bg-white focus:ring-2 ring-[#233D7B]/30"
                    placeholder="+880…"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</span>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px] outline-none focus:bg-white focus:ring-2 ring-[#233D7B]/30"
                    autoComplete="new-password"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirm password</span>
                  <input
                    type="password"
                    value={regPassword2}
                    onChange={(e) => setRegPassword2(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px] outline-none focus:bg-white focus:ring-2 ring-[#233D7B]/30"
                    autoComplete="new-password"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void doRegister();
                    }}
                  />
                </label>
                <button
                  type="button"
                  disabled={submittingRegister}
                  onClick={() => void doRegister()}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#C4161C] text-white py-3.5 text-[15px] font-semibold shadow-lg hover:bg-red-800 disabled:opacity-60 transition"
                >
                  {submittingRegister ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Create account
                </button>
                <p className="text-center text-xs text-slate-500 pt-2">
                  Already registered?{' '}
                  <Link to="/login" className="font-semibold text-[#233D7B] hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            )}

            <p className="mt-10 text-center text-xs text-slate-500 max-w-md mx-auto lg:mx-0">
              <Link to="/" className="text-[#233D7B] hover:underline font-medium">
                Back to home
              </Link>
              <span className="mx-2">·</span>
              <button type="button" className="hover:underline text-slate-600" onClick={() => logoutLocal()}>
                Clear saved session
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
