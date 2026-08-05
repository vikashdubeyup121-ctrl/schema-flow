import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { useThemeStore } from '@/shared/stores/theme.store';
import { Button } from '@/shared/components/Button';
import { Avatar } from '@/shared/components/Avatar';
import { Plus as AddIcon, Sun as SunIcon, Moon as MoonIcon, LogOut as LogOutIcon } from 'lucide-react';
import { useProjectMutations } from '@/features/project';
import { CreateProjectModal } from '@/features/project/components/CreateProjectModal';

export function AppHeader(): ReactNode {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useThemeStore();
  const [createOpen, setCreateOpen] = useState(false);
  const { create } = useProjectMutations();

  const handleCreateProject = (name: string) => {
    create.mutate(name, {
      onSuccess: () => {
        setCreateOpen(false);
        navigate('/dashboard'); // go to dashboard or just stay
      },
    });
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-6 h-14 flex items-center justify-between gap-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <LayersLogo />
            <span className="text-base font-semibold text-foreground">SchemaFlow</span>
          </button>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              leftIcon={<AddIcon size={14} />}
              onClick={() => setCreateOpen(true)}
            >
              New Project
            </Button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
                title="Toggle theme"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                {resolvedTheme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
              </button>
              <button
                onClick={() => navigate('/profile')}
                title="View Profile"
                className="hover:opacity-80 transition-opacity"
              >
                <Avatar src={user?.avatarUrl ?? null} name={user?.name ?? ''} size="sm" />
              </button>
              <button
                onClick={() => { void logout(); }}
                aria-label="Log out"
                title="Log out"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                <LogOutIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateProject}
        isLoading={create.isPending}
      />
    </>
  );
}

function LayersLogo(): ReactNode {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
