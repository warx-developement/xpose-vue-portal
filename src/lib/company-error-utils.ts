/**
 * Utility functions for handling company-related errors
 */

export const isCompanyUuidError = (error: any): boolean => {
  const errorMessage = error?.response?.data?.error || error?.response?.data?.message || '';
  const statusCode = error?.response?.status;
  const url = error?.config?.url || '';
  
  // Only trigger company selection for specific company UUID errors
  if (errorMessage.includes('Invalid company UUID')) {
    return true;
  }
  
  // Check for 404 errors only on dashboard endpoint (missing company context)
  if (url.includes('/dashboard') && statusCode === 404) {
    return true;
  }
  
  // Check for network errors that might indicate missing company context
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return true;
  }
  
  // Explicitly exclude "User not found in company" and similar user-related errors
  if (errorMessage.includes('User not found in company') || 
      errorMessage.includes('User not found') ||
      errorMessage.includes('Access denied') ||
      errorMessage.includes('Permission denied')) {
    return false;
  }
  
  return false;
};

export const createRetryConfig = () => ({
  retry: (failureCount: number, error: any) => {
    // Don't retry if it's a company UUID error
    if (isCompanyUuidError(error)) {
      return false;
    }
    return failureCount < 1; // Only retry once for other errors
  },
});
