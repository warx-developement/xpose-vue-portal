import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCVESearch } from '@/hooks/useCVESearch';
import { CVESearchFiltersState } from '@/hooks/useCVESearch';

interface CVESearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: CVESearchFiltersState) => void;
}

export const CVESearchModal: React.FC<CVESearchModalProps> = ({ isOpen, onClose, onSearch }) => {
  const {
    filters,
    updateFilters,
    clearFilters,
    searchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
  } = useCVESearch();

  const [localFilters, setLocalFilters] = useState<CVESearchFiltersState>(filters);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
    setHasUnsavedChanges(false);
  }, [filters]);

  const handleFilterChange = (key: keyof CVESearchFiltersState, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasUnsavedChanges(true);
    // Note: Filters are not applied immediately - user must click "Apply Filters" or "Search CVEs"
  };

  const handleApply = () => {
    // Filter out "any" values and empty strings before applying
    const cleanedFilters = { ...localFilters };
    
    // Remove "any" values and empty strings
    Object.keys(cleanedFilters).forEach(key => {
      const value = cleanedFilters[key as keyof CVESearchFiltersState];
      if (value === 'any' || value === '' || value === null || value === undefined) {
        delete cleanedFilters[key as keyof CVESearchFiltersState];
      }
    });
    
    updateFilters(cleanedFilters);
    setHasUnsavedChanges(false);
    onClose();
  };

  const handleSearch = () => {
    // Filter out "any" values and empty strings before searching
    const cleanedFilters = { ...localFilters };
    
    // Remove "any" values and empty strings
    Object.keys(cleanedFilters).forEach(key => {
      const value = cleanedFilters[key as keyof CVESearchFiltersState];
      if (value === 'any' || value === '' || value === null || value === undefined) {
        delete cleanedFilters[key as keyof CVESearchFiltersState];
      }
    });
    
    updateFilters(cleanedFilters);
    setHasUnsavedChanges(false);
    onSearch(cleanedFilters);
    onClose();
  };

  const handleClear = () => {
    clearFilters();
    setLocalFilters({
      showAdvancedFilters: false,
      resultsPerPage: 20,
      startIndex: 0,
    });
    setHasUnsavedChanges(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">CVE Search</h2>
              <p className="text-xs sm:text-sm text-gray-500">Search the National Vulnerability Database</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Form */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="space-y-4 sm:space-y-6">
            {/* Basic Search */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Quick Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* CVE ID Search */}
                <div className="space-y-2">
                  <Label htmlFor="cveId">CVE ID</Label>
                  <Input
                    id="cveId"
                    placeholder="e.g., CVE-2023-1234"
                    value={localFilters.cveId || ''}
                    onChange={(e) => handleFilterChange('cveId', e.target.value)}
                  />
                </div>

                {/* Keyword Search */}
                <div className="space-y-2">
                  <Label htmlFor="keywordSearch">Keyword Search</Label>
                  <div className="flex gap-2">
                    <Input
                      id="keywordSearch"
                      placeholder="Search in descriptions..."
                      value={localFilters.keywordSearch || ''}
                      onChange={(e) => handleFilterChange('keywordSearch', e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('keywordExactMatch', !localFilters.keywordExactMatch)}
                    >
                      {localFilters.keywordExactMatch ? 'Exact' : 'Any'}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="keywordExactMatch"
                      checked={localFilters.keywordExactMatch || false}
                      onCheckedChange={(checked) => handleFilterChange('keywordExactMatch', checked)}
                    />
                    <Label htmlFor="keywordExactMatch" className="text-sm">
                      Exact phrase match
                    </Label>
                  </div>
                </div>

                {/* CWE ID Search */}
                <div className="space-y-2">
                  <Label htmlFor="cweId">CWE ID</Label>
                  <Input
                    id="cweId"
                    placeholder="e.g., CWE-79, CWE-89"
                    value={localFilters.cweId || ''}
                    onChange={(e) => handleFilterChange('cweId', e.target.value)}
                  />
                </div>

                {/* Severity Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CVSS V2 Severity */}
                  <div className="space-y-2">
                    <Label htmlFor="cvssV2Severity">CVSS V2 Severity</Label>
                    <Select
                      value={localFilters.cvssV2Severity || 'any'}
                      onValueChange={(value) => handleFilterChange('cvssV2Severity', value === 'any' ? '' : value)}
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
                    <Label htmlFor="cvssV3Severity">CVSS V3 Severity</Label>
                    <Select
                      value={localFilters.cvssV3Severity || 'any'}
                      onValueChange={(value) => handleFilterChange('cvssV3Severity', value === 'any' ? '' : value)}
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

                {/* Search History */}
                {searchHistory.length > 0 && (
                  <div className="space-y-2">
                    <Label>Recent Searches</Label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {searchHistory.map((term, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs sm:text-sm px-2 py-1 cursor-pointer hover:bg-blue-100"
                          onClick={() => handleFilterChange('keywordSearch', term)}
                        >
                          {term}
                          <X
                            className="w-3 h-3 ml-1 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromSearchHistory(term);
                            }}
                          />
                        </Badge>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearchHistory}
                        className="text-xs sm:text-sm px-2 py-1 h-auto"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <Button variant="outline" onClick={handleClear} className="w-full sm:w-auto">
            Clear All
          </Button>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              onClick={handleApply} 
              className={`w-full sm:w-auto ${hasUnsavedChanges ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {hasUnsavedChanges ? 'Apply Changes' : 'Apply Filters'}
            </Button>
            <Button onClick={handleSearch} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4 mr-2" />
              Search CVEs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};