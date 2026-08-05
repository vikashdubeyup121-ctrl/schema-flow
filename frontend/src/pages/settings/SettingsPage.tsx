import { useEffect } from 'react';
import type { ReactNode } from 'react';

export function SettingsPage(): ReactNode {
  useEffect(() => {
    document.title = 'Settings | SchemaFlow';
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Settings coming soon.</p>
      </div>
    </div>
  );
}
