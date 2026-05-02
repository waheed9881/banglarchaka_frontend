import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { getAuthToken } from '@/lib/api';
import { completeStubPayment } from '@/lib/payments';

/** Prevents duplicate stub-completion requests for the same payment id (e.g. React Strict Mode). */
const completingStub = new Set<string>();

export function PaymentReturnEffects() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const payment = sp.get('payment');
    const pid = sp.get('payment_pid');
    if (!payment) return;

    const stripParams = () => {
      sp.delete('payment');
      sp.delete('payment_pid');
      const q = sp.toString();
      navigate({ pathname: location.pathname, search: q ? `?${q}` : '' }, { replace: true });
    };

    const sig = `${payment}:${pid ?? ''}`;

    if (payment === 'fail' || payment === 'cancel') {
      const key = `paytoast_${sig}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        if (payment === 'fail') toast.error('Payment did not complete.');
        else toast.message('Payment cancelled.');
      }
      stripParams();
      return;
    }

    if ((payment === 'callback' || payment === 'success') && pid) {
      if (completingStub.has(pid)) {
        stripParams();
        return;
      }

      if (!getAuthToken()) {
        toast.message('Sign in to finalize demo payments when returning from checkout.');
        stripParams();
        return;
      }

      completingStub.add(pid);
      completeStubPayment(pid)
        .then((res) => {
          toast.success(
            res.listing_boosted
              ? 'Payment recorded — listing featured for 7 days.'
              : 'Payment recorded.',
          );
        })
        .catch((e) => toast.error(e instanceof Error ? e.message : 'Could not confirm payment'))
        .finally(() => {
          completingStub.delete(pid);
          stripParams();
        });
      return;
    }

    stripParams();
  }, [location.pathname, location.search, navigate]);

  return null;
}
