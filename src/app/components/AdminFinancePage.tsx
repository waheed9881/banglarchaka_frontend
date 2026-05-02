import { useEffect } from 'react';
import { FinanceSuitePanel } from './FinanceSuitePanel';
import { setPageSeo } from '@/lib/seo';

export function AdminFinancePage() {
  useEffect(() => {
    setPageSeo('Finance admin · BanglarChaka', 'Chart of accounts, journals, and expenses.');
  }, []);

  return <FinanceSuitePanel variant="admin" />;
}
