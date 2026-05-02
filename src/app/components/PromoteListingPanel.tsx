import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { getAuthToken } from '@/lib/api';
import { createPaymentIntent } from '@/lib/payments';

const PRESETS = ['299', '499', '999'];

export function PromoteListingPanel({
  listingPublicId,
  listingTitle,
}: {
  /** Listing `public_id` from the API — stored on the payment morph (`payable_type=listing`). */
  listingPublicId?: string;
  listingTitle?: string;
}) {
  const [amount, setAmount] = useState(PRESETS[1]);
  const [method, setMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const run = async () => {
    if (!getAuthToken()) {
      setMsg('Sign in from the header first.');
      return;
    }
    const n = Number(amount);
    if (!Number.isFinite(n) || n < 1) {
      setMsg('Enter a valid amount (minimum 1 BDT).');
      return;
    }

    setBusy(true);
    setMsg('');
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await createPaymentIntent({
        amount: n,
        currency: 'BDT',
        method,
        return_url: origin ? `${origin}/` : undefined,
        ...(listingPublicId
          ? { payable_type: 'listing', payable_id: listingPublicId }
          : {}),
      });
      setMsg(`Started — reference ${res.gateway_reference || res.payment_public_id}.`);
      if (res.redirect_url) {
        window.location.assign(res.redirect_url);
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not start payment.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
        <Sparkles className="h-4 w-4 text-amber-600" />
        Promote (demo checkout)
      </div>
      {listingTitle ? (
        <p className="mt-1 line-clamp-2 text-xs text-gray-600" title={listingTitle}>
          {listingTitle}
        </p>
      ) : null}
      <p className="mt-2 text-xs leading-relaxed text-gray-600">
        Uses backend <span className="font-semibold">stub payments</span> for <span className="font-semibold">cash</span>{' '}
        / <span className="font-semibold">bank transfer</span>. Payment is linked to this listing when you’re signed in as
        the seller (same rule as editing the ad). SSLCommerz/bKash swap in later via drivers.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setAmount(v)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              amount === v ? 'border-[#233D7B] bg-[#233D7B] text-white' : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            {v} BDT
          </button>
        ))}
      </div>

      <label className="mt-3 block text-xs font-semibold text-gray-700">
        Amount (BDT)
        <input
          type="number"
          min={1}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-2 block text-xs font-semibold text-gray-700">
        Method
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as 'cash' | 'bank_transfer')}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="cash">Cash (stub)</option>
          <option value="bank_transfer">Bank transfer (stub)</option>
        </select>
      </label>

      <button
        type="button"
        disabled={busy}
        onClick={() => void run()}
        className="mt-4 w-full rounded-lg bg-[#C4161C] py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
      >
        {busy ? 'Starting…' : 'Start demo checkout'}
      </button>

      {msg ? <p className="mt-2 text-xs font-medium text-gray-800">{msg}</p> : null}
    </div>
  );
}
