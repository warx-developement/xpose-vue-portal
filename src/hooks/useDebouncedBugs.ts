import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bugsApi } from '@/lib/api';

export const useDebouncedBugs = (reportId: number, searchQuery: string, statusFilter: string, severityFilter: string) => {
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce the search query
  useEffect(() => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('Debounced search query updated:', searchQuery);
      setDebouncedSearchQuery(searchQuery);
    }, 1000); // 1000ms delay

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Create stable params object
  const queryParams = {
    search: debouncedSearchQuery.trim() || undefined,
    status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
    severity: severityFilter && severityFilter !== 'all' ? severityFilter : undefined,
  };

  // Only make API call when we have a debounced search query or when filters are applied
  const shouldMakeApiCall = debouncedSearchQuery.trim() !== '' || statusFilter !== 'all' || severityFilter !== 'all';

  const query = useQuery({
    queryKey: ['bugs', reportId, queryParams],
    queryFn: async () => {
      console.log('Making API call with params:', queryParams);
      const response = await bugsApi.getBugs(reportId, queryParams);
      return {
        bugs: response.data.data,
        pagination: response.data.pagination,
      };
    },
    enabled: !!reportId && shouldMakeApiCall,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    isDebouncing: searchQuery !== debouncedSearchQuery,
  };
};
