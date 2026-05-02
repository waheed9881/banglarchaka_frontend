import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { apiFetch } from '@/lib/api';
import { fetchMe, resolvePostLoginPath, selectDealerSubscriptionPlan, type MeResponse } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import { setPageSeo } from '@/lib/seo';
import { toast } from 'sonner';

type PlanRow = {
  id: number;
  slug: string;
  name: string;
  billing_interval: string;
  price: string;
  currency: string;
  trial_days: number;
  listing_quota: number | null;
};

export function DealerPlanSelectionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  useEffect(() => {
    setPageSeo(t('auth.dealerPlanSeoTitle'), t('auth.dealerPlanSeoDesc'));
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await fetchMe();
        if (cancelled) return;
        if (!u) {
          navigate('/login', { replace: true });
          return;
        }
        if (u.status && u.status !== 'pending_plan') {
          navigate(resolvePostLoginPath(u, null), { replace: true });
          return;
        }
        setMe(u);
        const res = await apiFetch<{ data: PlanRow[] }>('/subscription-plans');
        if (cancelled) return;
        setPlans(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) toast.error(t('auth.dealerPlanLoadFailed'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, t]);

  const choose = async (plan: PlanRow) => {
    setSubmittingId(plan.id);
    try {
      await selectDealerSubscriptionPlan({ plan_id: plan.id });
      const fresh = await fetchMe();
      setMe(fresh);
      toast.success(t('auth.dealerPlanComplete'));
      navigate(resolvePostLoginPath(fresh, null), { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('auth.dealerPlanSelectFailed'));
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading || !me) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#233D7B]" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900">{t('auth.dealerPlanHeading')}</h1>
        <p className="mt-2 text-slate-600">{t('auth.dealerPlanIntro')}</p>

        <div className="mt-8 space-y-3">
          {plans.map((p) => (
            <div
              key={p.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <div className="font-semibold text-slate-900">{p.name}</div>
                <div className="text-sm text-slate-500 mt-1">
                  {p.billing_interval} ·{' '}
                  {Number(p.price) === 0 ? t('auth.dealerPlanFree') : `${p.currency} ${p.price}`}
                  {p.trial_days > 0 ? ` · ${t('auth.dealerPlanTrialDays', { days: p.trial_days })}` : null}
                </div>
                {p.listing_quota != null ? (
                  <div className="text-xs text-slate-500 mt-1">
                    {t('auth.dealerPlanListingQuota', { count: p.listing_quota })}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                disabled={submittingId !== null}
                onClick={() => void choose(p)}
                className="inline-flex items-center justify-center gap-2 shrink-0 rounded-xl bg-[#C4161C] text-white px-5 py-3 text-sm font-semibold hover:bg-red-800 disabled:opacity-60"
              >
                {submittingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Check className="w-4 h-4" aria-hidden />}
                {t('auth.dealerPlanChoose')}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          <Link to="/" className="text-[#233D7B] font-medium hover:underline">
            {t('auth.backHome')}
          </Link>
        </p>
      </div>
    </div>
  );
}
