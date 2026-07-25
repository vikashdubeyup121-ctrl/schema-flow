import type { ReactNode } from 'react';

export function DashboardPage(): ReactNode {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Your projects will appear here.</p>
      </div>
    </div>
  );
}
