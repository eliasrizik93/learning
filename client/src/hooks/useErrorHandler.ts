import { useState, useCallback } from 'react';
import type { ErrorState } from '../types';

/**
 * Custom hook for managing error states and notifications
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState | null>(null);

  const showError = useCallback(
    (message: string, type: ErrorState['type'] = 'error') => {
      setError({
        message,
        type,
        timestamp: Date.now(),
      });
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      errorMessage = 'An error occurred'
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (err) {
        const message = err instanceof Error ? err.message : errorMessage;
        showError(message);
        return null;
      }
    },
    [showError]
  );

  return {
    error,
    showError,
    clearError,
    handleAsyncError,
  };
};
