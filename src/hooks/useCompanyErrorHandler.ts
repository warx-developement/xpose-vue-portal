import { useState, useCallback } from 'react';
import { CompanyItem } from '@/lib/api';
import { isCompanyUuidError } from '@/lib/company-error-utils';

export const useCompanyErrorHandler = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [retryCallback, setRetryCallback] = useState<(() => void) | null>(null);

  const handleApiError = useCallback((error: any, retryFn?: () => void) => {
    if (isCompanyUuidError(error)) {
      // Prevent opening multiple modals
      if (!isModalOpen) {
        setRetryCallback(() => retryFn || null);
        setIsModalOpen(true);
      }
      return true; // Indicates that the error was handled
    }
    
    return false; // Error was not handled
  }, [isModalOpen]);

  const handleCompanySelected = useCallback((company: CompanyItem) => {
    // Company selection is handled in the modal component
    // This callback can be used for additional logic if needed
    console.log('Company selected:', company);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setRetryCallback(null);
  }, []);

  return {
    handleApiError,
    isModalOpen,
    retryCallback,
    handleCompanySelected,
    closeModal
  };
};
