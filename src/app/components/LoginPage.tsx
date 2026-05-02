import { GoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { fetchMe, loginWithEmailPassword, loginWithGoogleIdToken, logoutLocal } from '@/lib/auth';
import { loginWithPhoneOtp, sendLoginOtp } from '@/lib/engagement';
import { setPageSeo } from '@/lib/seo';

const googleClientId =
  typeof import.meta.env.VITE_GOOGLE_CLIENT_ID === 'string' ? import.meta.env.VITE_GOOGLE_CLIENT_ID.trim() : '';

export function LoginPage() {
  const navigate = useNavigate();
  const [me, setMe] = useState<{ id: number; name: string; email: string } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpHint, setOtpHint] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setPageSeo('Sign in · BanglarChaka', 'Log in to manage listings, messages, and wishlist.');
  }, []);

  useEffect(() => {
    fetchMe().then((u) => {
      setMe(u);
      if (u) navigate('/', { replace: true });
    });
  }, [navigate]);

  const doLogin = async () => {
    try {
      const data = await loginWithEmailPassword(email.trim(), password);
      const meFresh = await fetchMe();
      setMe(meFresh || data.user);
      navigate('/');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Login failed');
    }
  };

  const doSendOtp = async () => {
    try {
      const res = await sendLoginOtp(otpPhone.trim());
      setOtpHint(res.debugCode ? `Dev OTP: ${res.debugCode}` : 'OTP sent — check SMS when wired.');
      setMsg('OTP sent');
      setTimeout(() => setMsg(''), 2500);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'OTP send failed');
    }
  };

  const doOtpLogin = async () => {
    try {
      await loginWithPhoneOtp(otpPhone.trim(), otpCode.trim());
      const meFresh = await fetchMe();
      setMe(meFresh);
      setOtpCode('');
      setOtpHint('');
      navigate('/');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'OTP login failed');
    }
  };

  if (me) {
    return null;
  }

  return (
    <div className="min-h-[70vh] bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-gray-600 mb-6">Use email and password, Google, or phone OTP.</p>

        {msg && (
          <div className="mb-4 text-sm rounded-md bg-amber-50 text-amber-900 px-3 py-2 border border-amber-200">{msg}</div>
        )}

        <div className="space-y-3 mb-6">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
            placeholder="Email"
            autoComplete="email"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => void doLogin()}
            className="w-full bg-[#233D7B] text-white py-2.5 rounded-md text-sm font-semibold hover:bg-[#1a2f5e] transition"
          >
            Sign In
          </button>
        </div>

        {googleClientId ? (
          <div className="flex justify-center mb-8 [&_iframe]:max-h-10">
            <GoogleLogin
              onSuccess={async (cred) => {
                if (!cred.credential) return;
                try {
                  await loginWithGoogleIdToken(cred.credential);
                  await fetchMe();
                  navigate('/');
                } catch (e) {
                  setMsg(e instanceof Error ? e.message : 'Google sign-in failed');
                }
              }}
              onError={() => setMsg('Google sign-in failed')}
              text="signin_with"
              shape="rectangular"
              size="large"
              theme="outline"
              type="standard"
            />
          </div>
        ) : null}

        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Phone OTP</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={otpPhone}
              onChange={(e) => setOtpPhone(e.target.value)}
              className="flex-1 min-w-[140px] px-3 py-2 rounded-md border border-gray-300 text-sm"
              placeholder="+8801…"
            />
            <button
              type="button"
              onClick={() => void doSendOtp()}
              className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50"
            >
              Send OTP
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <input
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-24 px-3 py-2 rounded-md border border-gray-300 text-sm"
              placeholder="Code"
            />
            <button
              type="button"
              onClick={() => void doOtpLogin()}
              className="px-4 py-2 rounded-md bg-[#C4161C] text-white text-sm font-semibold hover:bg-red-700"
            >
              Login with OTP
            </button>
          </div>
          {otpHint ? <p className="mt-2 text-xs text-amber-800">{otpHint}</p> : null}
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          <Link to="/" className="text-[#233D7B] hover:underline">
            Back to home
          </Link>
          {' · '}
          <button type="button" className="text-gray-500 hover:underline" onClick={() => logoutLocal()}>
            Clear session
          </button>
        </p>
      </div>
    </div>
  );
}
