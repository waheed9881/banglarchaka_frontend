import { useEffect } from 'react';
import { HrSuitePanel } from './HrSuitePanel';
import { setPageSeo } from '@/lib/seo';

export function DealerPortalHrPage() {
  useEffect(() => {
    setPageSeo('Dealer HR · BanglarChaka', 'Departments, employees, attendance, leave, and payroll for your dealership.');
  }, []);

  return <HrSuitePanel variant="dealer" />;
}
