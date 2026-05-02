import { useEffect, useState } from 'react';
import { fetchSubscriptionPlans, type SubscriptionPlanDto } from '@/lib/marketplace';

export function SubscriptionPlansStrip() {
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);

  useEffect(() => {
    fetchSubscriptionPlans().then(setPlans).catch(() => setPlans([]));
  }, []);

  if (!plans.length) {
    return null;
  }

  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Subscription tiers (read-only)</h2>
      <p className="mt-1 text-sm text-gray-600">
        Pulled from <code className="rounded bg-gray-100 px-1 text-xs">GET /subscription-plans</code>. Full subscribe &
        billing flows hook up when you wire payments and account linking.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => {
          const priceNum = Number(p.price);
          const free = !Number.isFinite(priceNum) || priceNum === 0;
          return (
            <div key={p.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="font-bold text-[#233D7B]">{p.name}</div>
              <div className="mt-2 text-xl font-bold text-gray-900">
                {free ? (
                  'Free'
                ) : (
                  <>
                    {p.currency || 'BDT'} {priceNum.toLocaleString()}
                    <span className="text-xs font-normal text-gray-500"> / {p.billing_interval}</span>
                  </>
                )}
              </div>
              <ul className="mt-3 space-y-1 text-xs text-gray-600">
                <li>
                  {p.listing_quota != null ? `${p.listing_quota} listings per cycle` : 'Unlimited listings'}
                </li>
                {p.trial_days ? <li>{p.trial_days}-day trial</li> : null}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
