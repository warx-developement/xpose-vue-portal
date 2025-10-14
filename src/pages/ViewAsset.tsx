import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAsset, useAssetSubdomains, useRecentSubdomains, useProcessSubdomainData } from '@/hooks/useAssets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Edit, 
  Globe,
  Target, 
  Calendar, 
  User, 
  Search,
  Upload,
  Activity,
  Server,
  Clock,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

const ViewAsset: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assetId = parseInt(id || '0');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [subdomainData, setSubdomainData] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [subdomainLimit, setSubdomainLimit] = useState(50);
  
  const { data: asset, isLoading: assetLoading, error: assetError } = useAsset(assetId);
  const { data: subdomainsData, isLoading: subdomainsLoading } = useAssetSubdomains(assetId, {
    page: currentPage,
    limit: subdomainLimit,
  });

  // Remove duplicate URLs and keep only the most recent one
  const uniqueSubdomains = React.useMemo(() => {
    if (!subdomainsData?.data) return [];
    
    const urlMap = new Map();
    subdomainsData.data.forEach(subdomain => {
      const existing = urlMap.get(subdomain.url);
      if (!existing || new Date(subdomain.last_seen) > new Date(existing.last_seen)) {
        urlMap.set(subdomain.url, subdomain);
      }
    });
    
    return Array.from(urlMap.values());
  }, [subdomainsData?.data]);
  const { data: recentSubdomains } = useRecentSubdomains(assetId, 10);
  const processSubdomainMutation = useProcessSubdomainData();

  const handleProcessSubdomainData = async () => {
    if (!subdomainData.trim()) {
      toast.error('Please enter subdomain data');
      return;
    }
    
    if (!selectedDomain) {
      toast.error('Please select a domain');
      return;
    }
    
    try {
      console.log('Processing subdomain data:', subdomainData);
      console.log('Selected domain:', selectedDomain);
      
      // Parse JSONL format (each line is a JSON object)
      const lines = subdomainData.trim().split('\n');
      const parsedData = lines.map(line => {
        try {
          return JSON.parse(line.trim());
        } catch (e) {
          throw new Error(`Invalid JSON on line: ${line.substring(0, 50)}...`);
        }
      });
      
      console.log('Parsed data:', parsedData);
      
      // Validate that we have data
      if (parsedData.length === 0) {
        toast.error('No valid JSON data found');
        return;
      }
      
      // Use the selected domain
      console.log('Calling API with selected domain:', { assetId, data: { domain: selectedDomain, data: parsedData } });
      await processSubdomainMutation.mutateAsync({
        assetId,
        data: { domain: selectedDomain, data: parsedData },
      });
      
      setIsUploadDialogOpen(false);
      setSubdomainData('');
      setSelectedDomain('');
    } catch (error) {
      console.error('Process subdomain data error:', error);
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON format. Please check your data and try again.');
      } else {
        toast.error(`Failed to process subdomain data: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (statusCode >= 400) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (assetLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (assetError || !asset) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Failed to load asset. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => navigate('/assets')}
            className="inline-flex items-center justify-center w-10 h-10 bg-purple-50 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors"
          >
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
            <p className="text-gray-600">Asset details and subdomain management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/assets/${assetId}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Asset
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Subdomain Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Subdomain Data</DialogTitle>
                <DialogDescription>
                  Paste your subdomain scan results in JSON format to process them.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain-select">Select Domain</Label>
                  <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose which domain this data belongs to" />
                    </SelectTrigger>
                    <SelectContent>
                      {asset?.domains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subdomain-data">Subdomain Data (JSONL)</Label>
                  <Textarea
                    id="subdomain-data"
                    value={subdomainData}
                    onChange={(e) => setSubdomainData(e.target.value)}
                    placeholder={`Example format (JSONL - one JSON object per line):
{"timestamp":"2025-10-07T10:28:39.876443188+02:00","port":"443","url":"https://bridge.samba.tv","input":"bridge.samba.tv","title":"Bridge","scheme":"https","content_type":"text/html","method":"GET","host":"199.36.158.100","path":"/","favicon":"866333450","favicon_md5":"3b5a67f225790ac7135a413f98fcf1b9","favicon_path":"/favicon.ico","favicon_url":"https://bridge.samba.tv/favicon.ico","time":"41.461197ms","a":["199.36.158.100"],"tech":["Firebase","HSTS","HTTP/3","Unpkg"],"words":74,"lines":19,"status_code":200,"content_length":531,"failed":false,"knowledgebase":{"PageType":"other","pHash":0},"resolvers":["8.8.4.4:53","8.8.8.8:53"]}
{"timestamp":"2025-10-07T10:28:40.144287707+02:00","cdn_name":"cloudflare","cdn_type":"waf","port":"443","url":"https://auth.samba.tv","input":"auth.samba.tv","location":"https://samba.tv/","scheme":"https","webserver":"cloudflare","content_type":"text/plain","method":"GET","host":"172.64.144.74","path":"/","time":"219.73883ms","a":["172.64.144.74","104.18.43.182"],"aaaa":["2606:4700:440c::6812:2bb6","2606:4700:4403::ac40:904a"],"cname":["samba-tv-prod-cd-qoazh2k8toay6a9i.edge.tenants.us.auth0.com"],"tech":["Auth0","Cloudflare","HSTS","HTTP/3"],"words":4,"lines":1,"status_code":302,"content_length":39,"failed":false,"cdn":true,"knowledgebase":{"PageType":"other","pHash":0},"resolvers":["213.136.95.11:53","1.0.0.1:53"]}`}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Expected format: JSONL (JSON Lines) - each line should be a valid JSON object with subdomain information. Select the domain above to assign this data to.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUploadDialogOpen(false);
                    setSelectedDomain('');
                    setSubdomainData('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProcessSubdomainData}
                  disabled={!subdomainData.trim() || !selectedDomain || processSubdomainMutation.isPending}
                >
                  {processSubdomainMutation.isPending ? 'Processing...' : 'Process Data'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Asset Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Domains</p>
                <p className="text-2xl font-bold text-gray-900">{asset.domains.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Subdomains Found</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subdomainsData?.pagination?.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Created By</p>
                <p className="text-lg font-semibold text-gray-900">{asset.created_by_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Domains List */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {asset.domains.map((domain, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                <Globe className="w-3 h-3 mr-1" />
                {domain}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subdomains Management */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Subdomains</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Subdomains</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search subdomains..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={subdomainLimit.toString()} onValueChange={(value) => setSubdomainLimit(parseInt(value))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {subdomainsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[80px]" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subdomain & Details</TableHead>
                      <TableHead>Infrastructure & Technology</TableHead>
                      <TableHead>Host & Records</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uniqueSubdomains.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No subdomains found
                        </TableCell>
                      </TableRow>
                    ) : (
                      uniqueSubdomains.map((subdomain) => (
                        <TableRow key={subdomain.id}>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(subdomain.status_code)}
                                <a
                                  href={subdomain.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                                >
                                  {subdomain.input || subdomain.domain}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                              {subdomain.title && (
                                <div className="text-sm text-gray-700 max-w-xs truncate" title={subdomain.title}>
                                  {subdomain.title}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-1">
                                <Badge variant={subdomain.status_code >= 200 && subdomain.status_code < 300 ? "default" : "destructive"} className="text-xs">
                                  {subdomain.status_code}
                                </Badge>
                                {subdomain.content_length && (
                                  <Badge variant="outline" className="text-xs">
                                    {subdomain.content_length.toLocaleString()}b
                                  </Badge>
                                )}
                                {subdomain.time && (
                                  <Badge variant="outline" className="text-xs">
                                    {subdomain.time}
                                  </Badge>
                                )}
                                {subdomain.content_type && (
                                  <Badge variant="outline" className="text-xs">
                                    {subdomain.content_type}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1">
                                {subdomain.webserver && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Server className="w-3 h-3 mr-1" />
                                    {subdomain.webserver}
                                  </Badge>
                                )}
                                {subdomain.cdn_name && (
                                  <Badge variant="default" className="text-xs bg-purple-100 text-purple-800">
                                    {subdomain.cdn_name}
                                  </Badge>
                                )}
                                {subdomain.cdn_type && (
                                  <Badge variant="outline" className="text-xs">
                                    {subdomain.cdn_type}
                                  </Badge>
                                )}
                                {subdomain.tech && subdomain.tech.slice(0, 3).map((tech, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                                {subdomain.tech && subdomain.tech.length > 3 && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>
                                          <Badge variant="outline" className="text-xs cursor-help">
                                            +{subdomain.tech.length - 3}
                                          </Badge>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="max-w-xs">
                                          <p className="font-medium mb-1">All Technologies:</p>
                                          <div className="flex flex-wrap gap-1">
                                            {subdomain.tech.map((tech, index) => (
                                              <Badge key={index} variant="outline" className="text-xs">
                                                {tech}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              {subdomain.host && (
                                <div className="text-sm text-gray-700">
                                  {subdomain.host}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {subdomain.a_records && subdomain.a_records.length > 0 && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>
                                          <Badge variant="outline" className="text-xs cursor-help">
                                            {subdomain.a_records.length} A record{subdomain.a_records.length > 1 ? 's' : ''}
                                          </Badge>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="max-w-xs">
                                          <p className="font-medium mb-1">A Records:</p>
                                          <div className="space-y-1">
                                            {subdomain.a_records.map((record, index) => (
                                              <div key={index} className="text-xs font-mono">
                                                {record}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {subdomain.aaaa_records && subdomain.aaaa_records.length > 0 && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>
                                          <Badge variant="outline" className="text-xs cursor-help">
                                            {subdomain.aaaa_records.length} AAAA
                                          </Badge>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="max-w-xs">
                                          <p className="font-medium mb-1">AAAA Records:</p>
                                          <div className="space-y-1">
                                            {subdomain.aaaa_records.map((record, index) => (
                                              <div key={index} className="text-xs font-mono">
                                                {record}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock className="w-3 h-3" />
                                {formatDate(subdomain.last_seen)}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Subdomains</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSubdomains?.data?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent subdomains found
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSubdomains?.data?.map((subdomain) => (
                    <div key={subdomain.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(subdomain.status_code)}
                          <div className="space-y-1">
                            <a
                              href={subdomain.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                              {subdomain.input || subdomain.domain}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <p className="text-xs text-gray-500">{subdomain.url}</p>
                            {subdomain.title && (
                              <p className="text-sm text-gray-700">{subdomain.title}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant={subdomain.status_code >= 200 && subdomain.status_code < 300 ? "default" : "destructive"}>
                            {subdomain.status_code}
                          </Badge>
                          <p className="text-xs text-gray-500">
                            {formatDate(subdomain.last_seen)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {subdomain.webserver && (
                          <Badge variant="outline" className="text-xs">
                            <Server className="w-3 h-3 mr-1" />
                            {subdomain.webserver}
                          </Badge>
                        )}
                        {subdomain.cdn_name && (
                          <Badge variant="secondary" className="text-xs">
                            {subdomain.cdn_name}
                          </Badge>
                        )}
                        {subdomain.tech && subdomain.tech.slice(0, 3).map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {subdomain.tech && subdomain.tech.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{subdomain.tech.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {subdomain.content_length && (
                          <span>{subdomain.content_length.toLocaleString()} bytes</span>
                        )}
                        {subdomain.time && (
                          <span>{subdomain.time}</span>
                        )}
                        {subdomain.host && (
                          <span>Host: {subdomain.host}</span>
                        )}
                        {subdomain.a_records && subdomain.a_records.length > 0 && (
                          <span>{subdomain.a_records.length} A record{subdomain.a_records.length > 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {subdomainsData?.pagination && subdomainsData.pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {uniqueSubdomains.length} unique subdomains (filtered from {subdomainsData.pagination.total} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {subdomainsData.pagination.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === subdomainsData.pagination.total_pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAsset;
