import React, { useState, useEffect, useRef } from 'react';
import { Search, AlertTriangle, Database, Clock, Shield, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CVEResultsList } from '@/components/cve/CVEResultsList';
import { CVEDetailsModal } from '@/components/cve/CVEDetailsModal';
import { useCVESearch } from '@/hooks/useCVESearch';
import { CVECVE } from '@/lib/cve-api';

export const CVESearch: React.FC = () => {
  const [selectedCVE, setSelectedCVE] = useState<CVECVE | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const dateRangeRef = useRef<HTMLDivElement>(null);

  const {
    results,
    totalResults,
    currentPage,
    resultsPerPage,
    isLoading,
    error,
    filters,
    searchHistory,
    searchCVEs,
    searchByCVEId,
    getCVEDetails,
    searchByKeyword,
    getRecentCVEs,
    getCVEsBySeverity,
    goToPage,
    clearFilters,
  } = useCVESearch();
  const safeResults = results || [];

  // Load recent CVEs on component mount with pagination
  useEffect(() => {
    searchCVEs({ resultsPerPage: 20, startIndex: 0 });
  }, []); // Empty dependency array to run only once on mount


  const handleQuickSearch = () => {
    // Prepare search filters
    const searchFilters: any = {};
    
    // Add text search if provided
    if (quickSearch.trim()) {
      // Check if it looks like a CVE ID
      if (quickSearch.toUpperCase().match(/^CVE-\d{4}-\d+$/)) {
        searchByCVEId(quickSearch.trim());
        return; // CVE ID search doesn't need date filters
      } else {
        searchFilters.keywordSearch = quickSearch.trim();
      }
    }
    
    // Add date range if provided
    if (startDate && endDate) {
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0] + 'T00:00:00.000';
      };
      searchFilters.pubStartDate = formatDate(startDate);
      searchFilters.pubEndDate = endDate.toISOString().split('T')[0] + 'T23:59:59.999';
    }
    
    // Only search if we have at least one filter
    if (quickSearch.trim() || (startDate && endDate)) {
      searchCVEs(searchFilters);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuickSearch();
    }
  };

  const handleViewDetails = async (cve: CVECVE) => {
    setShowDetailsModal(true);
    setIsLoadingDetails(true);
    
    try {
      // Fetch fresh CVE details using the specific CVE ID API
      const freshCVE = await getCVEDetails(cve.cve.id);
      if (freshCVE) {
        setSelectedCVE(freshCVE);
      } else {
        // Fallback to the existing CVE data if API call fails
        setSelectedCVE(cve);
      }
    } catch (error) {
      console.error('Error fetching CVE details:', error);
      // Fallback to the existing CVE data
      setSelectedCVE(cve);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const clearQuickSearch = () => {
    setQuickSearch('');
    setStartDate(null);
    setEndDate(null);
    // Clear all filters and trigger default search (recent CVEs)
    clearFilters();
  };

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    
    // Automatically call API when both dates are selected
    if (start && end) {
      const searchFilters: any = {
        pubStartDate: start.toISOString().split('T')[0] + 'T00:00:00.000',
        pubEndDate: end.toISOString().split('T')[0] + 'T23:59:59.999'
      };
      
      // Include text search if provided
      if (quickSearch.trim()) {
        if (quickSearch.toUpperCase().match(/^CVE-\d{4}-\d+$/)) {
          searchByCVEId(quickSearch.trim());
          return;
        } else {
          searchFilters.keywordSearch = quickSearch.trim();
        }
      }
      
      searchCVEs(searchFilters);
    }
  };

  const quickActions = [
    {
      title: 'Recent CVEs',
      description: 'Last 7 days',
      icon: <Clock className="w-5 h-5" />,
      action: () => getRecentCVEs(7),
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Critical CVEs',
      description: 'High severity',
      icon: <AlertTriangle className="w-5 h-5" />,
      action: () => getCVEsBySeverity('CRITICAL', 'v3'),
      color: 'bg-red-100 text-red-600',
    },
    {
      title: 'High CVEs',
      description: 'High severity',
      icon: <Shield className="w-5 h-5" />,
      action: () => getCVEsBySeverity('HIGH', 'v3'),
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'KEV Catalog',
      description: 'Known exploited',
      icon: <Database className="w-5 h-5" />,
      action: () => searchCVEs({ hasKev: true }),
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const popularSearches = [
    'Microsoft',
    'Apache',
    'Linux',
    'OpenSSL',
    'Java',
    'WordPress',
    'Docker',
    'Kubernetes',
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl">
            <Search className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">CVE Search</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Search the National Vulnerability Database for security vulnerabilities
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Search */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Search</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="CVE ID or keyword..."
                      value={quickSearch}
                      onChange={(e) => setQuickSearch(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleQuickSearch} 
                      disabled={!quickSearch.trim() && !(startDate && endDate)}
                      className="px-3 sm:px-4"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Published Date Range */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Published Date Range</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearQuickSearch}
                        className="text-xs h-6 px-2"
                      >
                        Clear
                      </Button>
                    </div>
                    
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={handleDateRangeChange}
                      placeholderText="Click to select date range"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      dateFormat="yyyy-MM-dd"
                      isClearable
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      popperClassName="react-datepicker-popper"
                      popperPlacement="bottom-start"
                    />
                  </div>

                  {/* CVE ID Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">CVE ID</label>
                    <Input
                      placeholder="e.g., CVE-2023-1234"
                      value={filters.cveId || ''}
                      onChange={(e) => {
                        const newFilters = { ...filters, cveId: e.target.value };
                        searchCVEs(newFilters);
                      }}
                    />
                  </div>

                  {/* Exclude Rejected Filter */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="noRejected"
                        checked={filters.noRejected || false}
                        onChange={(e) => {
                          const newFilters = { ...filters, noRejected: e.target.checked };
                          searchCVEs(newFilters);
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="noRejected" className="text-sm font-medium text-gray-700">
                        Exclude Rejected CVEs
                      </label>
                    </div>
                  </div>

                  {/* CWE ID Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">CWE ID</label>
                    <Input
                      placeholder="e.g., CWE-79, CWE-89"
                      value={filters.cweId || ''}
                      onChange={(e) => {
                        const newFilters = { ...filters, cweId: e.target.value };
                        searchCVEs(newFilters);
                      }}
                    />
                  </div>

                  {/* Severity Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* CVSS V2 Severity */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">CVSS V2 Severity</label>
                      <Select
                        value={filters.cvssV2Severity || 'any'}
                        onValueChange={(value) => {
                          const newFilters = { ...filters, cvssV2Severity: value === 'any' ? undefined : value as any };
                          searchCVEs(newFilters);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* CVSS V3 Severity */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">CVSS V3 Severity</label>
                      <Select
                        value={filters.cvssV3Severity || 'any'}
                        onValueChange={(value) => {
                          const newFilters = { ...filters, cvssV3Severity: value === 'any' ? undefined : value as any };
                          searchCVEs(newFilters);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-auto py-3 px-3"
                      onClick={action.action}
                      disabled={isLoading}
                    >
                      <div className={`p-1 rounded mr-2 sm:mr-3 ${action.color}`}>
                        {action.icon}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base truncate">{action.title}</div>
                        <div className="text-xs text-gray-500 truncate">{action.description}</div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Popular Searches */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Popular Searches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {popularSearches.map((term, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-200 text-xs sm:text-sm px-2 py-1"
                        onClick={() => searchByKeyword(term)}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Search History */}
              {searchHistory.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Recent Searches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {searchHistory.slice(0, 5).map((term, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => searchByKeyword(term)}
                        >
                          {term}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Results Header */}
            {safeResults.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Search Results
                    </h2>
                    <p className="text-sm text-gray-600">
                      {totalResults.toLocaleString()} CVE{totalResults !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Badge variant="outline" className="text-xs sm:text-sm">
                        Page {currentPage + 1} of {Math.ceil(totalResults / resultsPerPage)}
                      </Badge>
                      <Select
                        key={resultsPerPage} // Force re-render when resultsPerPage changes
                        value={resultsPerPage.toString()}
                        onValueChange={(value) => {
                          const newPageSize = parseInt(value);
                          console.log('Changing resultsPerPage from', resultsPerPage, 'to', newPageSize);
                          searchCVEs({ resultsPerPage: newPageSize, startIndex: 0 });
                        }}
                      >
                        <SelectTrigger className="w-16 sm:w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="200">200</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
                      Clear Filters
                    </Button>
                  </div>
                </div>

                {/* Active Filters */}
                {Object.keys(filters).some(key => 
                  filters[key as keyof typeof filters] !== undefined && 
                  filters[key as keyof typeof filters] !== '' &&
                  !['showAdvancedFilters', 'searchHistory', 'resultsPerPage', 'startIndex'].includes(key)
                ) && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Search className="w-4 h-4" />
                      Active Filters:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(filters).map(([key, value]) => {
                        if (!value || value === '' || ['showAdvancedFilters', 'searchHistory', 'resultsPerPage', 'startIndex'].includes(key)) {
                          return null;
                        }
                        return (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results */}
            <CVEResultsList 
              results={safeResults}
              isLoading={isLoading}
              error={error}
              onViewDetails={handleViewDetails}
            />

            {/* Pagination */}
            {safeResults.length > 0 && Math.ceil(totalResults / resultsPerPage) > 1 && (
              <div className="mt-6 sm:mt-8">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-xs sm:text-sm text-gray-600 text-center px-4">
                    Showing {currentPage * resultsPerPage + 1} to {Math.min((currentPage + 1) * resultsPerPage, totalResults)} of {totalResults} results
                  </span>
                </div>

                <div className="flex justify-center">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 0 || isLoading}
                      className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(3, Math.ceil(totalResults / resultsPerPage)) }, (_, i) => {
                        const page = i;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                            disabled={isLoading}
                            className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
                          >
                            {page + 1}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(totalResults / resultsPerPage) - 1 || isLoading}
                      className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Modals */}
      <CVEDetailsModal
        cve={selectedCVE}
        isOpen={showDetailsModal}
        isLoading={isLoadingDetails}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCVE(null);
          setIsLoadingDetails(false);
        }}
      />
    </div>
  );
};
