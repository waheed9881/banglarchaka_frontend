import { useEffect } from 'react';
import { HrSuitePanel } from './HrSuitePanel';
import { setPageSeo } from '@/lib/seo';

export function AdminHrPage() {
  useEffect(() => {
    setPageSeo('HR admin · BanglarChaka', 'Departments, employees, attendance, leave, and payroll.');
  }, []);

  return <HrSuitePanel variant="admin" />;
}
