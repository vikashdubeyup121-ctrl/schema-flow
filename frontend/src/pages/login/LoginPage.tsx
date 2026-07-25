import type { ReactNode } from 'react';

export function LoginPage(): ReactNode {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">SchemaFlow</h1>
        <p className="text-muted-foreground mb-8">Collaborative database schema designer</p>
        <button
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          aria-label="Sign in with Google"
          onClick={() => {
            window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/auth/google`;
          }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
