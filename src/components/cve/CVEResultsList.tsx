import React, { useState } from 'react';
import { 
  ExternalLink, 
  Calendar, 
  Shield, 
  AlertTriangle, 
  Database, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { CVECVE } from '@/lib/cve-api';
import { 
  formatCVEDate, 
  getCVSSSeverityColor, 
  getCVSSScoreColor, 
  truncateText, 
  extractCPEInfo,
  getCVSSData,
  getDescription,
  getCPEProducts
} from '@/lib/cve-api';

interface CVEResultsListProps {
  results: CVECVE[];
  isLoading: boolean;
  error: string | null;
  onViewDetails: (cve: CVECVE) => void;
}

export const CVEResultsList: React.FC<CVEResultsListProps> = ({
  results,
  isLoading,
  error,
  onViewDetails,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Safety check for results
  const safeResults = results || [];

  const toggleExpanded = (cveId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(cveId)) {
      newExpanded.delete(cveId);
    } else {
      newExpanded.add(cveId);
    }
    setExpandedItems(newExpanded);
  };

  const copyToClipboard = async (text: string, cveId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, cveId]));
      toast({
        title: "Copied to clipboard",
        description: "CVE ID copied successfully",
      });
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(cveId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };


  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Error loading CVEs</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (safeResults.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No CVEs found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {safeResults.map((cve) => {
        const isExpanded = expandedItems.has(cve.cve.id);
        const isCopied = copiedItems.has(cve.cve.id);
        const cvssData = getCVSSData(cve);
        const description = getDescription(cve);
        const products = getCPEProducts(cve);

        return (
          <Card key={cve.cve.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="space-y-3">
                {/* CVE ID and Severity Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle 
                      className="text-lg font-semibold text-blue-600 cursor-pointer hover:text-blue-800 hover:underline transition-colors"
                      onClick={() => onViewDetails(cve)}
                    >
                      {cve.cve.id}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(cve.cve.id, cve.cve.id)}
                      className="h-6 w-6 p-0"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                    {cvssData && (
                      <Badge 
                        className={`${getCVSSSeverityColor(cvssData.severity)} text-xs font-medium`}
                      >
                        {cvssData.severity} ({cvssData.score})
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(cve.cve.id)}
                    className="h-8 w-8 p-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                {/* Description */}
                <p className="text-sm text-gray-600">
                  {truncateText(description, 150)}
                </p>


                {/* Metadata - Stacked on Mobile */}
                <div className="space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Published: {formatCVEDate(cve.cve.published)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Modified: {formatCVEDate(cve.cve.lastModified)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>Source: {cve.cve.sourceIdentifier}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(cve.cve.id)}>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  
                  <div className="space-y-4">
                    {/* Full Description */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Description</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
                    </div>

                    {/* CVSS Information */}
                    {cvssData && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">
                          CVSS {cvssData.version.toUpperCase()} Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Base Score:</span>
                              <Badge className={getCVSSScoreColor(cvssData.score)}>
                                {cvssData.score}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Severity:</span>
                              <Badge className={getCVSSSeverityColor(cvssData.severity)}>
                                {cvssData.severity}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Vector String:</span>
                            <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                              {cvssData.vector}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Affected Products */}
                    {products.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">Affected Products</h4>
                        <div className="flex flex-wrap gap-2">
                          {products.map((product, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CWE Information */}
                    {cve.cve.weaknesses && cve.cve.weaknesses.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">Weaknesses (CWE)</h4>
                        <div className="space-y-2">
                          {cve.cve.weaknesses.slice(0, 3).map((weakness, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="font-medium text-gray-900">{weakness.type}</div>
                              <div className="text-gray-600 mt-1">
                                {weakness.description?.[0]?.value || 'No description available'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* References */}
                    {cve.cve.references && cve.cve.references.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">References</h4>
                        <div className="space-y-2">
                          {cve.cve.references.slice(0, 5).map((ref, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <a
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 break-all"
                              >
                                {ref.url}
                              </a>
                              {ref.tags && ref.tags.length > 0 && (
                                <div className="flex gap-1 ml-2">
                                  {ref.tags.slice(0, 2).map((tag, tagIndex) => (
                                    <Badge key={tagIndex} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CVE Status */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Status Information</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <div className="font-medium">{cve.cve.vulnStatus}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Source:</span>
                          <div className="font-medium">{cve.cve.sourceIdentifier}</div>
                        </div>
                        {cve.cve.evaluatorComment && (
                          <div className="col-span-2">
                            <span className="text-gray-600">Evaluator Comment:</span>
                            <div className="font-medium">{cve.cve.evaluatorComment}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}


      {/* Loading State */}
      {isLoading && safeResults.length === 0 && (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
