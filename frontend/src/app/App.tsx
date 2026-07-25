import { type ReactNode } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from './errorBoundary/ErrorBoundary';
import { ThemeProvider } from './providers/ThemeProvider';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './providers/AuthProvider';
import { KeyboardProvider } from './providers/KeyboardProvider';
import { ToastProvider } from './providers/ToastProvider';
import { router } from './router';

export function App(): ReactNode {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <KeyboardProvider>
              <ToastProvider>
                <RouterProvider router={router} />
              </ToastProvider>
            </KeyboardProvider>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
