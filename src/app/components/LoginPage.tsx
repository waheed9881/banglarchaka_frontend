import { GoogleLogin } from '@react-oauth/google';
import { Car, Check, ChevronDown, Loader2, Smartphone, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  fetchMe,
  loginWithEmailPassword,
  loginWithGoogleIdToken,
  registerAccount,
  verifyRegistrationOtp,
  logoutLocal,
  resolvePostLoginPath,
  type MeResponse,
} from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { loginWithPhoneOtp, sendLoginOtp, sendRegisterOtpEmail } from '@/lib/engagement';
import { useTranslation } from 'react-i18next';
import { setPageSeo } from '@/lib/seo';
import { toast } from 'sonner';

const googleClientId =
  typeof import.meta.env.VITE_GOOGLE_CLIENT_ID === 'string' ? import.meta.env.VITE_GOOGLE_CLIENT_ID.trim() : '';

/** Restrict `?next=` to same-origin relative paths (avoid open redirects). */
function safeReturnPath(next: string | null): string | null {
  if (next === null || next === '') return null;
  const p = next.trim();
  if (!p.startsWith('/') || p.startsWith('//') || p.includes('://') || p.includes('\\')) return null;
  return p;
}

type Tab = 'login' | 'register';

export function LoginPage({ variant }: { variant: Tab }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get('next'));
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
  const [regOtpStep, setRegOtpStep] = useState(false);
  const [regEmailMask, setRegEmailMask] = useState('');
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regOtpHint, setRegOtpHint] = useState('');
  const [regOtpSendBusy, setRegOtpSendBusy] = useState(false);
  const [regOtpVerifyBusy, setRegOtpVerifyBusy] = useState(false);
  const [regOtpResendSec, setRegOtpResendSec] = useState(0);
  const [regAccountType, setRegAccountType] = useState<'buyer' | 'dealer'>('buyer');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [showLoginVerify, setShowLoginVerify] = useState(false);
  const [loginVerifyEmail, setLoginVerifyEmail] = useState('');
  const [loginVerifyMask, setLoginVerifyMask] = useState('');
  const [loginResendBusy, setLoginResendBusy] = useState(false);

  useEffect(() => {
    setTab(variant);
    setRegOtpStep(false);
    setRegOtpCode('');
    setRegOtpHint('');
    setRegOtpResendSec(0);
    setRegAccountType('buyer');
    setRegBusinessName('');
    setShowLoginVerify(false);
    setLoginVerifyEmail('');
    setLoginVerifyMask('');
  }, [variant]);

  useEffect(() => {
    const title = variant === 'register' ? t('auth.registerSeoTitle') : t('auth.seoTitle');
    const desc = variant === 'register' ? t('auth.registerSeoDesc') : t('auth.seoDesc');
    setPageSeo(title, desc);
  }, [variant, t]);

  useEffect(() => {
    fetchMe().then((u) => {
      if (!u) {
        setMe(null);
        return;
      }
      if (u.status === 'pending_plan') {
        navigate('/register/dealer-plan', { replace: true });
        return;
      }
      setMe(u);
      navigate(resolvePostLoginPath(u, returnTo), { replace: true });
    });
  }, [navigate, returnTo]);

  useEffect(() => {
    if (otpResendSec <= 0) return;
    const id = window.setTimeout(() => setOtpResendSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [otpResendSec]);

  useEffect(() => {
    if (regOtpResendSec <= 0) return;
    const id = window.setTimeout(() => setRegOtpResendSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [regOtpResendSec]);

  const doLogin = async () => {
    setSubmittingLogin(true);
    setShowLoginVerify(false);
    try {
      const data = await loginWithEmailPassword(email.trim(), password);
      if (data.requires_plan_selection) {
        toast.success(data.message || t('auth.dealerPlanRedirect'));
        navigate('/register/dealer-plan', { replace: true });
        return;
      }
      let meFresh = await fetchMe();
      if (!meFresh && data.user.roles?.length) {
        meFresh = data.user as MeResponse;
      }
      setMe(meFresh || data.user);
      toast.success(t('auth.welcomeBack'));
      navigate(resolvePostLoginPath(meFresh, returnTo));
    } catch (e) {
      if (e instanceof ApiError && e.code === 'email_verification_required') {
        const body = e.body as { email_mask?: string } | undefined;
        setLoginVerifyEmail(email.trim());
        setLoginVerifyMask(typeof body?.email_mask === 'string' ? body.email_mask : '');
        setShowLoginVerify(true);
        toast.error(e.message);
        return;
      }
      toast.error(e instanceof Error ? e.message : t('auth.loginFailed'));
    } finally {
      setSubmittingLogin(false);
    }
  };

  const doResendLoginVerification = async () => {
    const em = loginVerifyEmail.trim() || email.trim();
    if (!em) {
      toast.error(t('auth.enterEmail'));
      return;
    }
    setLoginResendBusy(true);
    try {
      const res = await sendRegisterOtpEmail(em);
      if (res.debugCode) {
        toast.success(t('auth.otpHintDev', { code: res.debugCode }));
      } else {
        toast.success(t('auth.registrationOtpSent'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('auth.otpSendFailed'));
    } finally {
      setLoginResendBusy(false);
    }
  };

  const doRegister = async () => {
    if (regPassword !== regPassword2) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }
    const email = regEmail.trim();
    if (!email) {
      toast.error(t('auth.enterEmail'));
      return;
    }
    if (regAccountType === 'dealer' && !regBusinessName.trim()) {
      toast.error(t('auth.dealerBusinessRequired'));
      return;
    }
    setSubmittingRegister(true);
    try {
      const data = await registerAccount({
        name: regName.trim(),
        email,
        password: regPassword,
        password_confirmation: regPassword2,
        registration_type: regAccountType,
        ...(regAccountType === 'dealer' && regBusinessName.trim()
          ? { business_name: regBusinessName.trim() }
          : {}),
        ...(regPhone.trim() ? { phone: regPhone.trim() } : {}),
      });
      if ('requires_otp' in data && data.requires_otp) {
        setRegEmailMask(data.email_mask || email);
        setRegOtpStep(true);
        setRegOtpCode('');
        if (data.debug_code) {
          setRegOtpHint(t('auth.otpHintDev', { code: data.debug_code }));
          toast.success(t('auth.otpHintDev', { code: data.debug_code }));
        } else {
          setRegOtpHint('');
          toast.success(t('auth.registrationOtpSent'));
        }
        setRegOtpResendSec(45);
        return;
      }
      const auth = data;
      let meFresh = await fetchMe();
      if (!meFresh && auth.user.roles?.length) {
        meFresh = auth.user as MeResponse;
      }
      setMe(meFresh || auth.user);
      toast.success(t('auth.accountCreated'));
      navigate(resolvePostLoginPath(meFresh, returnTo));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('auth.registerFailed'));
    } finally {
      setSubmittingRegister(false);
    }
  };

  const doResendRegisterOtp = async () => {
    const email = regEmail.trim();
    if (!email) return;
    setRegOtpSendBusy(true);
    try {
      const res = await sendRegisterOtpEmail(email);
      if (res.debugCode) {
        setRegOtpHint(t('auth.otpHintDev', { code: res.debugCode }));
        toast.success(t('auth.otpHintDev', { code: res.debugCode }));
      } else {
        setRegOtpHint('');
        toast.success(t('auth.registrationOtpSent'));
      }
      setRegOtpResendSec(45);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('auth.otpSendFailed'));
    } finally {
      setRegOtpSendBusy(false);
    }
  };

  const doVerifyRegisterOtp = async () => {
    const email = regEmail.trim();
    if (!email || !regOtpCode.trim()) {
      toast.error(t('auth.emailOtpRequired'));
      return;
    }
    setRegOtpVerifyBusy(true);
    try {
      const auth = await verifyRegistrationOtp(email, regOtpCode.trim());
      setRegOtpStep(false);
      setRegOtpCode('');
      setRegOtpHint('');
      setRegOtpResendSec(0);
      if (auth.requires_plan_selection) {
        toast.success(t('auth.accountVerifiedPickPlan'));
        navigate('/register/dealer-plan', { replace: true });
        return;
      }
      let meFresh = await fetchMe();
      if (!meFresh && auth.user.roles?.length) {
        meFresh = auth.user as MeResponse;
      }
      setMe(meFresh || auth.user);
      toast.success(t('auth.accountCreated'));
      navigate(resolvePostLoginPath(meFresh, returnTo));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('auth.verifyRegistrationFailed'));
    } finally {
      setRegOtpVerifyBusy(false);
    }
  };

  const doSendOtp = async () => {
    const p = otpPhone.trim();
    if (!p) {
      toast.error(t('auth.enterMobile'));
      return;
    }
    setOtpSendBusy(true);
    try {
      const res = await sendLoginOtp(p);
      if (res.debugCode) {
        setOtpHint(t('auth.otpHintDev', { code: res.debugCode }));
        toast.success(t('auth.otpHintDev', { code: res.debugCode }));
      } else {
        setOtpHint('');
        toast.success(t('auth.otpSentSms'));
      }
      setOtpDelivered(true);
      setOtpResendSec(45);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('auth.otpSendFailed'));
    } finally {
      setOtpSendBusy(false);
    }
  };

  const doOtpLogin = async () => {
    const p = otpPhone.trim();
    if (!p || !otpCode.trim()) {
      toast.error(t('auth.phoneOtpRequired'));
      return;
    }
    setOtpVerifyBusy(true);
    try {
      const otpAuth = await loginWithPhoneOtp(p, otpCode.trim());
      if (otpAuth.requires_plan_selection) {
        toast.success(otpAuth.message || t('auth.dealerPlanRedirect'));
        navigate('/register/dealer-plan', { replace: true });
        return;
      }
      const meFresh = await fetchMe();
      setMe(meFresh);
      setOtpCode('');
      setOtpHint('');
      setOtpDelivered(false);
      setOtpResendSec(0);
      toast.success(t('auth.welcomeBack'));
      navigate(resolvePostLoginPath(meFresh, returnTo));
    } catch (e) {
      if (e instanceof ApiError && e.code === 'email_verification_required') {
        toast.error(e.message);
        return;
      }
      toast.error(e instanceof Error ? e.message : t('auth.otpLoginFailed'));
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
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
              <p>We never post on your behalf. Google only shares your basic profile when you choose that option.</p>
            </div>
          </div>

          <div className="flex-1 p-6 sm:p-10 xl:p-12">
            <div className="lg:hidden mb-8 text-center">
              <h2 className="text-xl font-bold text-slate-900">{t('auth.title')} · BanglarChaka</h2>
              <p className="text-sm text-slate-600 mt-1">{t('auth.subtitle')}</p>
            </div>

            <div className="flex p-1 rounded-xl bg-[#233D7B] mb-8 max-w-md mx-auto lg:mx-0">
              <Link to="/login" className={`${tabBtn(tab === 'login')} text-center block`}>
                {t('nav.signIn')}
              </Link>
              <Link to="/register" className={`${tabBtn(tab === 'register')} text-center block`}>
                {t('nav.register')}
              </Link>
            </div>

            {tab === 'login' ? (
              <div className="space-y-6 max-w-md mx-auto lg:mx-0">
                {showLoginVerify ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950 space-y-3">
                    <p className="font-semibold">{t('auth.loginVerifyTitle')}</p>
                    <p>
                      {loginVerifyMask
                        ? t('auth.loginVerifyBlurbMask', { mask: loginVerifyMask })
                        : t('auth.loginVerifyBlurb')}
                    </p>
                    <p className="text-xs text-amber-900/90">{t('auth.loginVerifyHint')}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={loginResendBusy}
                        onClick={() => void doResendLoginVerification()}
                        className="rounded-lg bg-amber-600 text-white px-3 py-2 text-xs font-semibold hover:bg-amber-700 disabled:opacity-50"
                      >
                        {loginResendBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" aria-hidden /> : null}{' '}
                        {t('auth.resendOtp')}
                      </button>
                      <Link
                        to={`/register?email=${encodeURIComponent(loginVerifyEmail || email.trim())}`}
                        className="rounded-lg border border-amber-700/40 px-3 py-2 text-xs font-semibold text-amber-950 hover:bg-amber-100/80"
                      >
                        {t('auth.goToVerifyRegister')}
                      </Link>
                    </div>
                  </div>
                ) : null}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">{t('auth.orContinue')} Google</p>
                  {googleClientId ? (
                    <div className="flex justify-center [&_iframe]:max-h-[44px]" data-busy={googleBusy ? '1' : undefined}>
                      <GoogleLogin
                        onSuccess={async (cred) => {
                          if (!cred.credential) return;
                          setGoogleBusy(true);
                          try {
                            const data = await loginWithGoogleIdToken(cred.credential);
                            if (data.requires_plan_selection) {
                              toast.success(data.message || t('auth.dealerPlanRedirect'));
                              navigate('/register/dealer-plan', { replace: true });
                              return;
                            }
                            const meFresh = await fetchMe();
                            toast.success(t('auth.welcomeBack'));
                            navigate(resolvePostLoginPath(meFresh, returnTo));
                          } catch (e) {
                            if (e instanceof ApiError && e.code === 'email_verification_required') {
                              toast.error(e.message);
                              return;
                            }
                            toast.error(e instanceof Error ? e.message : t('auth.googleSignInFailed'));
                          } finally {
                            setGoogleBusy(false);
                          }
                        }}
                        onError={() => toast.error(t('auth.googleSignInFailed'))}
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
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                      {t('common.loading')}
                    </p>
                  ) : null}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                    <span className="bg-white px-3">{t('auth.orContinue')} email</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t('auth.emailPlaceholder')}
                    </span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px] outline-none ring-[#233D7B]/30 focus:bg-white focus:ring-2"
                      placeholder={t('auth.emailPlaceholder')}
                      autoComplete="email"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t('auth.passwordPlaceholder')}
                    </span>
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
                  <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-sm font-medium text-[#233D7B] hover:underline">
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>
                  <button
                    type="button"
                    disabled={submittingLogin}
                    onClick={() => void doLogin()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#233D7B] text-white py-3.5 text-[15px] font-semibold shadow-lg shadow-[#233D7B]/25 hover:bg-[#1a2f5e] disabled:opacity-60 transition"
                  >
                    {submittingLogin ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> : null}
                    {t('auth.signInEmail')}
                  </button>
                </div>

                <details className="group rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/90 to-white shadow-sm overflow-hidden [&[open]]:ring-2 [&[open]]:ring-[#233D7B]/15 [&[open]]:border-[#233D7B]/25">
                  <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden px-4 py-4 sm:px-5 sm:py-4 flex items-center gap-3 sm:gap-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#233D7B]/10 text-[#233D7B]">
                      <Smartphone className="w-5 h-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-semibold text-slate-900">{t('auth.phoneOtpHeading')}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t('auth.phoneOtpBlurb')}</p>
                    </div>
                    <ChevronDown className="w-5 h-5 shrink-0 text-slate-400 group-open:rotate-180 transition-transform duration-200" aria-hidden />
                  </summary>

                  <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-slate-100/90">
                    <div className="flex items-center gap-2 pt-5 pb-4" role="presentation">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          otpDelivered ? 'bg-emerald-600 text-white' : 'bg-[#233D7B] text-white'
                        }`}
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

                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {t('auth.phonePlaceholder')}
                        </span>
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
                      </label>

                      <button
                        type="button"
                        disabled={otpSendBusy || otpResendSec > 0}
                        onClick={() => void doSendOtp()}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-[#233D7B]/25 bg-[#233D7B]/8 text-[#233D7B] py-3 text-sm font-semibold hover:bg-[#233D7B]/12 disabled:opacity-50 disabled:pointer-events-none transition"
                      >
                        {otpSendBusy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : null}
                        {otpResendSec > 0
                          ? `${t('auth.sendOtp')} (${otpResendSec}s)`
                          : otpDelivered
                            ? t('auth.resendOtp')
                            : t('auth.sendOtp')}
                      </button>

                      <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4">
                        <label className="block">
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {t('auth.otpPlaceholder')}
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
                          {otpVerifyBusy ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> : null}
                          {t('auth.signInOtp')}
                        </button>
                      </div>

                      {otpHint ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-3 text-xs text-amber-950 tabular-nums">
                          {import.meta.env.DEV ? (
                            <p className="font-semibold text-amber-900 mb-1">Development</p>
                          ) : null}
                          <p>{otpHint}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </details>
              </div>
            ) : regOtpStep ? (
              <div className="space-y-4 max-w-md mx-auto lg:mx-0">
                <div className="flex items-start gap-3 rounded-xl border border-[#233D7B]/20 bg-[#233D7B]/5 p-4">
                  <ShieldCheck className="w-8 h-8 shrink-0 text-[#233D7B]" aria-hidden />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{t('auth.verifyEmailTitle')}</h3>
                    <p className="text-sm text-slate-600 mt-1">{t('auth.verifyEmailBlurb', { mask: regEmailMask })}</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={regOtpSendBusy || regOtpResendSec > 0}
                  onClick={() => void doResendRegisterOtp()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-[#233D7B]/25 bg-[#233D7B]/8 text-[#233D7B] py-3 text-sm font-semibold hover:bg-[#233D7B]/12 disabled:opacity-50 disabled:pointer-events-none transition"
                >
                  {regOtpSendBusy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : null}
                  {regOtpResendSec > 0 ? `${t('auth.resendOtp')} (${regOtpResendSec}s)` : t('auth.resendOtp')}
                </button>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('auth.otpPlaceholder')}</span>
                  <input
                    value={regOtpCode}
                    onChange={(e) => setRegOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-center text-lg font-mono tracking-[0.4em] text-slate-900 outline-none ring-[#C4161C]/20 focus:ring-2"
                    placeholder="••••••"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void doVerifyRegisterOtp();
                    }}
                  />
                </label>
                <button
                  type="button"
                  disabled={regOtpVerifyBusy}
                  onClick={() => void doVerifyRegisterOtp()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C4161C] text-white py-3.5 text-[15px] font-semibold shadow-md shadow-[#C4161C]/20 hover:bg-red-800 disabled:opacity-60 transition"
                >
                  {regOtpVerifyBusy ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> : null}
                  {t('auth.verifyAndActivate')}
                </button>
                {regOtpHint ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-3 text-xs text-amber-950 tabular-nums">
                    {import.meta.env.DEV ? <p className="font-semibold text-amber-900 mb-1">Development</p> : null}
                    <p>{regOtpHint}</p>
                  </div>
                ) : null}
                <p className="text-center text-xs text-slate-500 pt-2">
                  <Link to="/login" className="font-semibold text-[#233D7B] hover:underline">
                    {t('nav.signIn')}
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-w-md mx-auto lg:mx-0">
                <p className="text-sm text-slate-600 mb-2">{t('auth.registerSeoDesc')}</p>
                <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRegAccountType('buyer')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                      regAccountType === 'buyer' ? 'bg-white text-[#233D7B] shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {t('auth.accountTypeBuyer')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegAccountType('dealer')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                      regAccountType === 'dealer' ? 'bg-white text-[#233D7B] shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {t('auth.accountTypeDealer')}
                  </button>
                </div>
                <p className="text-xs text-slate-500">{t('auth.accountTypeHint')}</p>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('auth.fullName')}</span>
                  <input
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px] outline-none focus:bg-white focus:ring-2 ring-[#233D7B]/30"
                    autoComplete="name"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('auth.emailPlaceholder')}</span>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px] outline-none focus:bg-white focus:ring-2 ring-[#233D7B]/30"
                    autoComplete="email"
                  />
                </label>
                {regAccountType === 'dealer' ? (
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t('auth.dealerBusinessName')}
                    </span>
                    <input
                      value={regBusinessName}
                      onChange={(e) => setRegBusinessName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px] outline-none focus:bg-white focus:ring-2 ring-[#233D7B]/30"
                      placeholder={t('auth.dealerBusinessPlaceholder')}
                      autoComplete="organization"
                    />
                  </label>
                ) : null}
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('auth.phoneOptional')}
                  </span>
                  <input
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px] outline-none focus:bg-white focus:ring-2 ring-[#233D7B]/30"
                    placeholder="+880…"
                    autoComplete="tel"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('auth.passwordPlaceholder')}</span>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px] outline-none focus:bg-white focus:ring-2 ring-[#233D7B]/30"
                    autoComplete="new-password"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('auth.confirmPassword')}</span>
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
                  {submittingRegister ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> : null}
                  {t('nav.register')}
                </button>
                <p className="text-center text-xs text-slate-500 pt-2">
                  {t('auth.alreadyRegistered')}{' '}
                  <Link to="/login" className="font-semibold text-[#233D7B] hover:underline">
                    {t('nav.signIn')}
                  </Link>
                </p>
              </div>
            )}

            <p className="mt-10 text-center text-xs text-slate-500 max-w-md mx-auto lg:mx-0">
              <Link to="/" className="text-[#233D7B] hover:underline font-medium">
                {t('auth.backHome')}
              </Link>
              <span className="mx-2">·</span>
              <button type="button" className="hover:underline text-slate-600" onClick={() => logoutLocal()}>
                {t('auth.clearSession')}
              </button>
            </p>

            {import.meta.env.DEV ? (
              <div className="mt-8 max-w-md mx-auto lg:mx-0 rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-left text-[11px] leading-relaxed text-gray-600 space-y-2">
                <p className="font-semibold text-gray-800">Demo logins (password for all)</p>
                <p className="text-gray-700">
                  Common password: <code className="bg-white px-1 rounded">password</code>
                </p>
                <p>
                  Super admin / admin HR:{' '}
                  <code className="bg-white px-1 rounded">admin@banglarchaka.local</code> —{' '}
                  <code className="bg-white px-1 rounded">test@example.com</code>
                </p>
                <p>
                  Dealer HR portal: <code className="bg-white px-1 rounded">dealer@banglarchaka.test</code>
                </p>
                <p>
                  Staff roles:{' '}
                  <code className="bg-white px-1 rounded">hr.manager@banglarchaka.test</code>,{' '}
                  <code className="bg-white px-1 rounded">finance.officer@banglarchaka.test</code>
                </p>
                <p className="text-gray-500">
                  Laravel must be running ({' '}
                  <code className="bg-white px-1 rounded">php artisan serve</code> ). If login still fails, reseed:{' '}
                  <code className="bg-white px-1 rounded">php artisan db:seed</code>
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}