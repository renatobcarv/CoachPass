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
        <Toaster 
          position="top-right"
          richColors
          expand={false}
          closeButton
        />
      </AuthProvider>
    </ThemeProvider>
  );
}