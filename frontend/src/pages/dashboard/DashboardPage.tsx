import { useEffect, type ReactNode } from 'react';
import { DashboardWidget } from '@/widgets/dashboard';

export function DashboardPage(): ReactNode {
  useEffect(() => {
    document.title = 'Dashboard | SchemaFlow';
  }, []);

  return <DashboardWidget />;
}
