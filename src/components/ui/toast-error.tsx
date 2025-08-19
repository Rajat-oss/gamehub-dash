import { toast } from "sonner";
import { FirestoreErrorInfo } from "@/utils/firestoreErrorHandler";

export const showFirestoreError = (error: FirestoreErrorInfo) => {
  const getErrorMessage = (errorInfo: FirestoreErrorInfo): string => {
    switch (errorInfo.code) {
      case 'QUOTA_EXCEEDED':
        return 'Too many requests. Please wait a moment and try again.';
      case 'SERVICE_UNAVAILABLE':
        return 'Service temporarily unavailable. Retrying...';
      case 'TIMEOUT':
        return 'Request timed out. Please try again.';
      case 'PERMISSION_DENIED':
        return 'Permission denied. Please check your authentication.';
      case 'NOT_FOUND':
        return 'Requested resource not found.';
      default:
        return errorInfo.message || 'An unexpected error occurred.';
    }
  };

  const message = getErrorMessage(error);
  
  if (error.shouldRetry) {
    toast.warning(message, {
      description: error.retryAfter ? `Retrying in ${Math.ceil(error.retryAfter / 1000)} seconds...` : undefined,
      duration: error.retryAfter || 5000,
    });
  } else {
    toast.error(message, {
      duration: 5000,
    });
  }
};

export const showRateLimitError = (message: string = 'Too many requests. Please slow down.') => {
  toast.warning(message, {
    description: 'Please wait a moment before trying again.',
    duration: 5000,
  });
};