import React, { useEffect } from 'react';

/**
 * Wrapper to suppress known Recharts duplicate key warnings
 * This is a cosmetic issue in Recharts v2.15.2 Surface component
 * that doesn't affect functionality
 */
export const ChartWrapper = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Suppress the specific Recharts duplicate key warning
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Encountered two children with the same key')
      ) {
        // Suppress this specific warning from Recharts
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return <>{children}</>;
};