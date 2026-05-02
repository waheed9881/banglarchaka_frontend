import { useEffect } from 'react';
import { FinanceSuitePanel } from './FinanceSuitePanel';
import { setPageSeo } from '@/lib/seo';

export function DealerPortalFinancePage() {
  useEffect(() => {
    setPageSeo('Dealer finance · BanglarChaka', 'Chart of accounts, journals, and expenses for your dealership.');
  }, []);

  return <FinanceSuitePanel variant="dealer" />;
}
