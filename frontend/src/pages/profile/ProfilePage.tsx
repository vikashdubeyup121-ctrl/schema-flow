import type { ReactNode } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Avatar } from '@/shared/components/Avatar';
import { Button } from '@/shared/components/Button';
import { useNavigate } from 'react-router-dom';

export function ProfilePage(): ReactNode {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">User Profile</h1>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </header>
      
      <main className="max-w-3xl mx-auto py-12 px-6">
        <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-6 shadow-sm">
          <Avatar 
            src={user?.avatarUrl ?? null} 
            name={user?.name ?? ''} 
            size="lg" 
            className="w-24 h-24 text-4xl" // Override to make it extra large for the profile page
          />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
            <p className="text-muted-foreground mt-1">{user?.email}</p>
          </div>
          <div className="w-full h-px bg-border my-2" />
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground">User ID</span>
              <span className="text-sm text-foreground font-mono bg-surface px-3 py-1.5 rounded-md">{user?.id}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground">Account Status</span>
              <span className="text-sm text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-md font-medium">Active</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-muted-foreground">Authentication Method</span>
              <span className="text-sm text-foreground bg-surface px-3 py-1.5 rounded-md flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google OAuth
              </span>
            </div>
          </div>
          <div className="w-full mt-6 flex justify-center">
            <Button variant="danger" onClick={() => { void logout(); }}>
              Sign Out Securely
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
