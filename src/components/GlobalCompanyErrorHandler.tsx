import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCompanyErrorHandler } from '@/hooks/useCompanyErrorHandler';
import { CompanySelectionModal } from '@/components/CompanySelectionModal';

export const GlobalCompanyErrorHandler: React.FC = () => {
  const queryClient = useQueryClient();
  const { 
    handleApiError, 
    isModalOpen, 
    retryCallback, 
    handleCompanySelected, 
    closeModal 
  } = useCompanyErrorHandler();

  useEffect(() => {
    const handleCompanyError = (event: CustomEvent) => {
      const { error } = event.detail;
      
      // Create a retry callback that invalidates all queries
      const retryCallback = () => {
        queryClient.invalidateQueries();
      };
      
      handleApiError(error, retryCallback);
    };

    // Listen for the custom event dispatched by the API interceptor
    window.addEventListener('company-uuid-error', handleCompanyError as EventListener);

    return () => {
      window.removeEventListener('company-uuid-error', handleCompanyError as EventListener);
    };
  }, [handleApiError, queryClient]);

  return (
    <CompanySelectionModal
      isOpen={isModalOpen}
      onClose={closeModal}
      onCompanySelected={handleCompanySelected}
      retryCallback={retryCallback || undefined}
      isRequired={true}
    />
  );
};
