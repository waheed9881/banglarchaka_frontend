import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchSubscriptionPlans, type SubscriptionPlanDto } from '@/lib/marketplace';

function parseFeaturedSlots(matrix: SubscriptionPlanDto['feature_matrix']): 'none' | 'unlimited' | number | null {
  if (!matrix || typeof matrix !== 'object' || Array.isArray(matrix)) {
    return null;
  }
  const raw = (matrix as Record<string, unknown>).featured_slots;
  if (raw === undefined) {
    return null;
  }
  if (raw === null) {
    return 'unlimited';
  }
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) {
    return null;
  }
  if (n <= 0) {
    return 'none';
  }
  return n;
}

export function SubscriptionPlansStrip() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);

  useEffect(() => {
    fetchSubscriptionPlans().then(setPlans).catch(() => setPlans([]));
  }, []);

  if (!plans.length) {
    return null;
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-gray-900">{t('subscriptionPlansStrip.title')}</h2>
      <p className="mt-1 text-sm text-gray-600">{t('subscriptionPlansStrip.subtitle')}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => {
          const priceNum = Number(p.price);
          const free = !Number.isFinite(priceNum) || priceNum === 0;
          const featured = parseFeaturedSlots(p.feature_matrix);

          return (
            <div key={p.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="font-bold text-[#233D7B]">{p.name}</div>
              <div className="mt-2 text-xl font-bold text-gray-900">
                {free ? (
                  t('subscriptionPlansStrip.freeLabel')
                ) : (
                  <>
                    {p.currency || 'BDT'} {priceNum.toLocaleString()}
                    <span className="text-xs font-normal text-gray-500"> / {p.billing_interval}</span>
                  </>
                )}
              </div>
              <ul className="mt-3 space-y-1 text-xs text-gray-600">
                <li>
                  {p.listing_quota != null
                    ? t('subscriptionPlansStrip.listingsPerCycle', { count: p.listing_quota })
                    : t('subscriptionPlansStrip.listingsUnlimited')}
                </li>
                {p.trial_days ? <li>{t('subscriptionPlansStrip.trialDays', { count: p.trial_days })}</li> : null}
                {featured === 'unlimited' ? (
                  <li className="font-semibold text-[#233D7B]">{t('subscriptionPlansStrip.featuredUnlimited')}</li>
                ) : featured === 'none' ? (
                  <li>{t('subscriptionPlansStrip.featuredNone')}</li>
                ) : typeof featured === 'number' ? (
                  <li className="font-semibold text-[#233D7B]">{t('subscriptionPlansStrip.featuredSlots', { count: featured })}</li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
