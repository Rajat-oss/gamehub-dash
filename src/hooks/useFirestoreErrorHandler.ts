import { useState, useCallback } from 'react';
import { FirestoreErrorHandler, FirestoreErrorInfo } from '@/utils/firestoreErrorHandler';

interface UseFirestoreErrorHandlerReturn {
  error: FirestoreErrorInfo | null;
  isLoading: boolean;
  clearError: () => void;
  executeWithErrorHandling: <T>(operation: () => Promise<T>) => Promise<T | null>;
}

export function useFirestoreErrorHandler(): UseFirestoreErrorHandlerReturn {
  const [error, setError] = useState<FirestoreErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await FirestoreErrorHandler.withRetry(operation);
      return result;
    } catch (err) {
      const errorInfo = FirestoreErrorHandler.handleError(err);
      setError(errorInfo);
      
      // Show user-friendly error messages
      if (errorInfo.code === 'QUOTA_EXCEEDED') {
        console.warn('Firestore quota exceeded. Please reduce request frequency.');
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    error,
    isLoading,
    clearError,
    executeWithErrorHandling
  };
}