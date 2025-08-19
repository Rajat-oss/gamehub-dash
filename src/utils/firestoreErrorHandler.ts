import { FirebaseError } from 'firebase/app';

export interface FirestoreErrorInfo {
  code: string;
  message: string;
  shouldRetry: boolean;
  retryAfter?: number;
}

export class FirestoreErrorHandler {
  static handleError(error: any): FirestoreErrorInfo {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'resource-exhausted':
          return {
            code: 'QUOTA_EXCEEDED',
            message: 'Request quota exceeded. Please try again later.',
            shouldRetry: true,
            retryAfter: 60000 // 1 minute
          };
        
        case 'unavailable':
          return {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Service temporarily unavailable. Retrying...',
            shouldRetry: true,
            retryAfter: 5000 // 5 seconds
          };
        
        case 'deadline-exceeded':
          return {
            code: 'TIMEOUT',
            message: 'Request timed out. Please try again.',
            shouldRetry: true,
            retryAfter: 3000 // 3 seconds
          };
        
        case 'permission-denied':
          return {
            code: 'PERMISSION_DENIED',
            message: 'Permission denied. Please check your authentication.',
            shouldRetry: false
          };
        
        case 'not-found':
          return {
            code: 'NOT_FOUND',
            message: 'Requested resource not found.',
            shouldRetry: false
          };
        
        default:
          return {
            code: error.code,
            message: error.message,
            shouldRetry: false
          };
      }
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred.',
      shouldRetry: false
    };
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const errorInfo = this.handleError(error);
        
        if (!errorInfo.shouldRetry || attempt === maxRetries) {
          throw error;
        }
        
        const delay = errorInfo.retryAfter || baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
}

export const withFirestoreErrorHandling = FirestoreErrorHandler.withRetry;