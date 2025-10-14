import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Calendar, 
  Shield, 
  AlertTriangle, 
  Database, 
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp
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
  extractCPEInfo,
  getCVSSData,
  getDescription,
  getCPEProducts,
  getCPEDetails
} from '@/lib/cve-api';

interface CVEDetailsModalProps {
  cve: CVECVE | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
}

export const CVEDetailsModal: React.FC<CVEDetailsModalProps> = ({ cve, isOpen, isLoading = false, onClose }) => {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'cvss']));
  const { toast } = useToast();

  if (!isOpen) return null;

  // Show loading state if CVE is being fetched
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-gray-600">Loading CVE details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cve) return null;

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, itemId]));
      toast({
        title: "Copied to clipboard",
        description: "Content copied successfully",
      });
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
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

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };




  const cvssData = getCVSSData(cve);
  const description = getDescription(cve);
  const products = getCPEDetails(cve);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{cve.cve.id}</h2>
              <p className="text-sm text-gray-500">CVE Details</p>
            </div>
            {cvssData && (
              <Badge className={`${getCVSSSeverityColor(cvssData.severity)} text-sm font-medium`}>
                {cvssData.severity} ({cvssData.score})
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Overview Section */}
              <Card>
                <Collapsible 
                  open={expandedSections.has('overview')} 
                  onOpenChange={() => toggleSection('overview')}
                >
                  <CardHeader className="pb-3">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Database className="w-5 h-5" />
                          Overview
                        </CardTitle>
                        {expandedSections.has('overview') ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">Description</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Published:</span>
                          <div className="font-medium">{formatCVEDate(cve.cve.published)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Modified:</span>
                          <div className="font-medium">{formatCVEDate(cve.cve.lastModified)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <div className="font-medium">{cve.cve.vulnStatus}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Source:</span>
                          <div className="font-medium">{cve.cve.sourceIdentifier}</div>
                        </div>
                      </div>

                      {cve.cve.evaluatorComment && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900 mb-2">Evaluator Comment</h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{cve.cve.evaluatorComment}</p>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* CVSS Information */}
              {cvssData && (
                <Card>
                  <Collapsible 
                    open={expandedSections.has('cvss')} 
                    onOpenChange={() => toggleSection('cvss')}
                  >
                    <CardHeader className="pb-3">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            CVSS {cvssData.version.toUpperCase()} Information
                          </CardTitle>
                          {expandedSections.has('cvss') ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
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
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Vector String:</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(cvssData.vector, 'vector')}
                                className="h-6 w-6 p-0"
                              >
                                {copiedItems.has('vector') ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div>
                            <div className="p-3 bg-gray-100 rounded text-xs font-mono break-all">
                              {cvssData.vector}
                            </div>
                          </div>
                        </div>

                        {/* Detailed CVSS Metrics */}
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900 mb-3">Detailed Metrics</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            {Object.entries(cvssData.data).map(([key, value]) => {
                              if (key === 'vectorString' || key === 'baseScore' || key === 'baseSeverity' || key === 'version') return null;
                              return (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className="font-medium">{value}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Affected Products */}
              {products.length > 0 && (
                <Card>
                  <Collapsible 
                    open={expandedSections.has('products')} 
                    onOpenChange={() => toggleSection('products')}
                  >
                    <CardHeader className="pb-3">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Affected Products ({products.length})
                          </CardTitle>
                          {expandedSections.has('products') ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-3">
                          {products.map((product, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">
                                  {product.vendor} {product.product}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={product.vulnerable ? "destructive" : "secondary"}>
                                    {product.vulnerable ? "Vulnerable" : "Not Vulnerable"}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(product.criteria, `cpe-${index}`)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {copiedItems.has(`cpe-${index}`) ? (
                                      <Check className="w-3 h-3 text-green-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 font-mono break-all">
                                {product.criteria}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* CWE Information */}
              {cve.cve.weaknesses && cve.cve.weaknesses.length > 0 && (
                <Card>
                  <Collapsible 
                    open={expandedSections.has('weaknesses')} 
                    onOpenChange={() => toggleSection('weaknesses')}
                  >
                    <CardHeader className="pb-3">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Weaknesses (CWE) ({cve.cve.weaknesses.length})
                          </CardTitle>
                          {expandedSections.has('weaknesses') ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-3">
                          {cve.cve.weaknesses.map((weakness, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">{weakness.type}</div>
                                <Badge variant="outline">{weakness.source}</Badge>
                              </div>
                              <div className="text-sm text-gray-700">
                                {weakness.description?.[0]?.value || 'No description available'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* References */}
              {cve.cve.references && cve.cve.references.length > 0 && (
                <Card>
                  <Collapsible 
                    open={expandedSections.has('references')} 
                    onOpenChange={() => toggleSection('references')}
                  >
                    <CardHeader className="pb-3">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <ExternalLink className="w-5 h-5" />
                            References ({cve.cve.references.length})
                          </CardTitle>
                          {expandedSections.has('references') ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-3">
                          {cve.cve.references.map((ref, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-start gap-3">
                                <ExternalLink className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <a
                                    href={ref.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 break-all"
                                  >
                                    {ref.url}
                                  </a>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Source: {ref.source}
                                  </div>
                                  {ref.tags && ref.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {ref.tags.map((tag, tagIndex) => (
                                        <Badge key={tagIndex} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(ref.url, `ref-${index}`)}
                                  className="h-6 w-6 p-0 flex-shrink-0"
                                >
                                  {copiedItems.has(`ref-${index}`) ? (
                                    <Check className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Last updated: {formatCVEDate(cve.cve.lastModified)}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(cve.cve.id, 'cve-id')}
              className="flex items-center gap-2"
            >
              {copiedItems.has('cve-id') ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              Copy CVE ID
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
