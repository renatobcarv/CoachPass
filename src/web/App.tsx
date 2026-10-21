'use client'

import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        {/* Avisos com o visual da marca (estilos .cp-toast em brand.css) */}
        <Toaster
          position="top-right"
          expand={false}
          closeButton
          gap={10}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: 'cp-toast',
              title: 'cp-toast-title',
              description: 'cp-toast-desc',
              icon: 'cp-toast-icon',
              closeButton: 'cp-toast-close',
              actionButton: 'cp-toast-action',
              success: 'cp-toast-success',
              error: 'cp-toast-error',
              info: 'cp-toast-info',
              warning: 'cp-toast-warning',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}