import { useState, useCallback, useRef } from 'react';
import { cveApiService, CVESearchFilters, CVESearchResponse, CVECVE } from '@/lib/cve-api';

export interface CVESearchState {
  results: CVECVE[];
  totalResults: number;
  currentPage: number;
  resultsPerPage: number;
  isLoading: boolean;
  error: string | null;
}

export interface CVESearchFiltersState extends CVESearchFilters {
  // Additional UI state
  showAdvancedFilters: boolean;
}

const initialState: CVESearchState = {
  results: [],
  totalResults: 0,
  currentPage: 0,
  resultsPerPage: 20,
  isLoading: false,
  error: null,
};

const initialFilters: CVESearchFiltersState = {
  showAdvancedFilters: false,
  resultsPerPage: 20,
  startIndex: 0,
};

export const useCVESearch = () => {
  const [state, setState] = useState<CVESearchState>(initialState);
  const [filters, setFilters] = useState<CVESearchFiltersState>(initialFilters);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestTimeRef = useRef<number>(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to clean empty values from search parameters
  const cleanSearchParams = (params: any): any => {
    const cleaned: any = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string' && value.trim() !== '') {
          cleaned[key] = value.trim();
        } else if (typeof value === 'boolean' || typeof value === 'number') {
          cleaned[key] = value;
        } else if (Array.isArray(value) && value.length > 0) {
          cleaned[key] = value;
        } else if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0) {
          cleaned[key] = value;
        }
      }
    });
    return cleaned;
  };

  // Rate limiting function to ensure 1 request per second
  const rateLimitedRequest = useCallback(async (requestFn: () => Promise<any>) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    
    if (timeSinceLastRequest < 1000) {
      // Wait for the remaining time to ensure 1 second between requests
      const waitTime = 1000 - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTimeRef.current = Date.now();
    return requestFn();
  }, []);

  // Reset search state
  const resetSearch = useCallback(() => {
    setState(initialState);
    setFilters(initialFilters);
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<CVESearchFiltersState>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      startIndex: 0, // Reset to first page when filters change
    }));
  }, []);

  // Add to search history
  const addToSearchHistory = useCallback((searchTerm: string) => {
    if (searchTerm.trim() && !searchHistory.includes(searchTerm.trim())) {
      setSearchHistory(prev => [searchTerm.trim(), ...prev.slice(0, 9)]); // Keep last 10 searches
    }
  }, [searchHistory]);

  // Remove from search history
  const removeFromSearchHistory = useCallback((searchTerm: string) => {
    setSearchHistory(prev => prev.filter(term => term !== searchTerm));
  }, []);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // Perform search with debouncing and rate limiting
  const searchCVEs = useCallback(async (searchFilters?: Partial<CVESearchFiltersState>) => {
    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Clean empty values from search parameters
    const searchParams = cleanSearchParams({ ...filters, ...searchFilters });
    
    // Add to search history if it's a keyword search
    if (searchParams.keywordSearch) {
      addToSearchHistory(searchParams.keywordSearch);
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    // Debounce the API call by 300ms to prevent rapid successive calls
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await rateLimitedRequest(() => cveApiService.searchCVEs(searchParams));
        const data: CVESearchResponse = response.data;

        setState(prev => ({
          ...prev,
          results: data.vulnerabilities,
          totalResults: data.totalResults,
          currentPage: searchParams.startIndex ? Math.floor(searchParams.startIndex / searchParams.resultsPerPage!) : 0,
          resultsPerPage: searchParams.resultsPerPage || data.resultsPerPage,
          isLoading: false,
        }));

        // Update filters with the search parameters used
        setFilters(prev => ({
          ...prev,
          ...searchParams,
        }));

      } catch (error: any) {
        if (error.name === 'AbortError') {
          return; // Request was cancelled
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.response?.data?.message || error.message || 'An error occurred while searching CVEs',
        }));
      }
    }, 300);
  }, [filters, addToSearchHistory, rateLimitedRequest]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    // Trigger default search (recent CVEs) after clearing filters
    // Use a clean search without any filter parameters
    const cleanSearch = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await rateLimitedRequest(() => 
          cveApiService.searchCVEs({ resultsPerPage: 20, startIndex: 0 })
        );
        
        const data = response.data;
        setState(prev => ({
          ...prev,
          results: data.vulnerabilities,
          totalResults: data.totalResults,
          currentPage: 0,
          resultsPerPage: 20,
          isLoading: false,
        }));
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error.response?.data?.message || error.message || 'An error occurred while searching CVEs',
          }));
        }
      }
    };
    
    cleanSearch();
  }, [rateLimitedRequest]);

  // Go to specific page
  const goToPage = useCallback((page: number) => {
    if (state.isLoading) return;

    const startIndex = page * state.resultsPerPage;
    searchCVEs({ startIndex });
  }, [state.isLoading, state.resultsPerPage, searchCVEs]);

  // Quick search by CVE ID
  const searchByCVEId = useCallback(async (cveId: string) => {
    if (!cveId.trim()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await cveApiService.getCVEById(cveId.trim());
      const data: CVESearchResponse = response.data;

      setState(prev => ({
        ...prev,
        results: data.vulnerabilities,
        totalResults: data.vulnerabilities.length,
        currentPage: 0,
        isLoading: false,
      }));

      addToSearchHistory(cveId.trim());
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || error.message || 'CVE not found',
      }));
    }
  }, [addToSearchHistory]);

  // Get detailed CVE information for viewing
  const getCVEDetails = useCallback(async (cveId: string): Promise<CVECVE | null> => {
    if (!cveId.trim()) return null;

    try {
      const response = await rateLimitedRequest(() => cveApiService.getCVEById(cveId.trim()));
      const data: CVESearchResponse = response.data;
      
      // Return the first (and only) CVE from the response
      return data.vulnerabilities.length > 0 ? data.vulnerabilities[0] : null;
    } catch (error: any) {
      console.error('Error fetching CVE details:', error);
      return null;
    }
  }, [rateLimitedRequest]);

  // Quick search by keyword
  const searchByKeyword = useCallback(async (keyword: string, exactMatch: boolean = false) => {
    if (!keyword || keyword.trim() === '') return;

    const searchParams = cleanSearchParams({
      keywordSearch: keyword.trim(),
      keywordExactMatch: exactMatch,
      startIndex: 0,
    });

    await searchCVEs(searchParams);
  }, [searchCVEs, cleanSearchParams]);

  // Quick search by CPE
  const searchByCPE = useCallback(async (cpeName: string, isVulnerable: boolean = false) => {
    if (!cpeName || cpeName.trim() === '') return;

    const searchParams = cleanSearchParams({
      cpeName: cpeName.trim(),
      isVulnerable,
      startIndex: 0,
    });

    await searchCVEs(searchParams);
  }, [searchCVEs, cleanSearchParams]);

  // Get recent CVEs with rate limiting, debouncing, and request cancellation
  const getRecentCVEs = useCallback(async (days: number = 30) => {
    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Debounce the API call by 500ms to prevent rapid successive calls
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        // Use rate limiting for the API call
        const response = await rateLimitedRequest(() => cveApiService.getRecentCVEs(days));
        const data: CVESearchResponse = response.data;

        setState(prev => ({
          ...prev,
          results: data.vulnerabilities,
          totalResults: data.totalResults,
          currentPage: 0,
          resultsPerPage: data.resultsPerPage,
          isLoading: false,
        }));

        // Update filters to reflect recent search
        setFilters(prev => ({
          ...prev,
          startIndex: 0,
          resultsPerPage: data.resultsPerPage,
        }));

      } catch (error: any) {
        if (error.name === 'AbortError') {
          return; // Request was cancelled
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.response?.data?.message || error.message || 'Failed to fetch recent CVEs',
        }));
      }
    }, 500); // 500ms debounce for recent CVEs
  }, [rateLimitedRequest]);

  // Get CVEs by severity
  const getCVEsBySeverity = useCallback(async (severity: string, version: 'v2' | 'v3' | 'v4' = 'v3') => {
    if (!severity || severity.trim() === '') return;

    const searchParams = cleanSearchParams({
      startIndex: 0,
    });

    if (version === 'v2') {
      searchParams.cvssV2Severity = severity.trim() as any;
    } else if (version === 'v3') {
      searchParams.cvssV3Severity = severity.trim() as any;
    } else {
      searchParams.cvssV4Severity = severity.trim() as any;
    }

    await searchCVEs(searchParams);
  }, [searchCVEs, cleanSearchParams]);

  // Get CVEs by date range
  const getCVEsByDateRange = useCallback(async (startDate: string, endDate: string, type: 'published' | 'modified' | 'kev' = 'published') => {
    if (!startDate || !endDate || startDate.trim() === '' || endDate.trim() === '') return;

    const searchParams: any = cleanSearchParams({
      startIndex: 0,
    });

    if (type === 'published') {
      searchParams.pubStartDate = startDate.trim();
      searchParams.pubEndDate = endDate.trim();
    } else if (type === 'modified') {
      searchParams.lastModStartDate = startDate.trim();
      searchParams.lastModEndDate = endDate.trim();
    } else {
      searchParams.kevStartDate = startDate.trim();
      searchParams.kevEndDate = endDate.trim();
    }

    await searchCVEs(searchParams);
  }, [searchCVEs, cleanSearchParams]);

  // Toggle advanced filters
  const toggleAdvancedFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      showAdvancedFilters: !prev.showAdvancedFilters,
    }));
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    // State
    ...state,
    filters,
    searchHistory,
    
    // Actions
    searchCVEs,
    searchByCVEId,
    getCVEDetails,
    searchByKeyword,
    searchByCPE,
    getRecentCVEs,
    getCVEsBySeverity,
    getCVEsByDateRange,
    goToPage,
    updateFilters,
    clearFilters,
    resetSearch,
    toggleAdvancedFilters,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
    cleanup,
  };
};
