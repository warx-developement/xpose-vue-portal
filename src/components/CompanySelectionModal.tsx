import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { companiesApi, CompanyItem } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanySelected: (company: CompanyItem) => void;
  retryCallback?: () => void;
  isRequired?: boolean; // New prop to make modal non-cancellable
}

export const CompanySelectionModal: React.FC<CompanySelectionModalProps> = ({
  isOpen,
  onClose,
  onCompanySelected,
  retryCallback,
  isRequired = false
}) => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [currentCompany, setCurrentCompany] = useState<CompanyItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(null);
  const { toast } = useToast();
  const { setCompanyUuid, setCompanyId } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await companiesApi.getCompanies();
      const { current_company, available_companies } = response.data.data;
      
      setCurrentCompany(current_company);
      setCompanies(available_companies);
      
      // Set the current company as default selection
      setSelectedCompany(current_company);
    } catch (error: any) {
      console.error('Failed to fetch companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySelect = (company: CompanyItem) => {
    setSelectedCompany(company);
  };

  const handleConfirmSelection = async () => {
    if (!selectedCompany) return;

    try {
      // Update the company in localStorage and store
      setCompanyUuid(selectedCompany.uuid);
      setCompanyId(selectedCompany.id);
      
      toast({
        title: "Company selected",
        description: `Switched to ${selectedCompany.name}`,
      });

      onCompanySelected(selectedCompany);
      
      // Retry the original API call if provided
      if (retryCallback) {
        retryCallback();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to switch company:', error);
      toast({
        title: "Error",
        description: "Failed to switch company. Please try again.",
        variant: "destructive",
      });
    }
  };

  const CompanyCard = ({ company, isSelected, onClick }: {
    company: CompanyItem;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{company.name}</h3>
            {company.uuid === currentCompany?.uuid && (
              <Badge variant="secondary" className="text-xs">
                Current
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">{company.domain}</p>
          <p className="text-xs text-gray-500">{company.address}</p>
        </div>
        <div className={`w-4 h-4 rounded-full border-2 ${
          isSelected
            ? 'border-blue-500 bg-blue-500'
            : 'border-gray-300'
        }`}>
          {isSelected && (
            <div className="w-full h-full rounded-full bg-white scale-50"></div>
          )}
        </div>
      </div>
    </div>
  );

  const CompanySkeleton = () => (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="w-4 h-4 rounded-full" />
      </div>
    </div>
  );

  // Custom DialogContent that conditionally shows the close button
  const CustomDialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
  >(({ className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className,
        )}
        {...props}
      >
        {children}
        {!isRequired && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  ));
  CustomDialogContent.displayName = "DialogContent";

  return (
    <Dialog open={isOpen} onOpenChange={isRequired ? undefined : onClose}>
      <CustomDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                <path d="M19 21V19C19 17.9391 18.5786 16.9217 17.8284 16.1716C17.0783 15.4214 16.0609 15 15 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            Select Company
          </DialogTitle>
          <DialogDescription>
            No company is currently selected. Please choose a company to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <CompanySkeleton key={i} />
              ))}
            </div>
          ) : companies.length > 0 ? (
            <div className="space-y-3">
              {companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  isSelected={selectedCompany?.id === company.id}
                  onClick={() => handleCompanySelect(company)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                  <path d="M19 21V19C19 17.9391 18.5786 16.9217 17.8284 16.1716C17.0783 15.4214 16.0609 15 15 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Companies Available</h3>
              <p className="text-gray-600">You don't have access to any companies.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          {!isRequired && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleConfirmSelection}
            disabled={!selectedCompany || isLoading}
            className="min-w-24"
          >
            {isLoading ? 'Loading...' : 'Select Company'}
          </Button>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
};
