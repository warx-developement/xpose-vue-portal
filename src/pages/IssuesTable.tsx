import React, { useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Bug, Edit, Settings, Eye, FileText, BarChart3, MessageSquare, Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useBugs, useDeleteBug, useBug, useBugComments, useBugTimeline, useCreateComment } from '@/hooks/useBugs';
import { StatusChangeModal } from '@/components/StatusChangeModal';
import { IssueDetails } from '@/components/issues/IssueDetails';
import { TimelineCard } from '@/components/issues/TimelineCard';
import { CommentsCard } from '@/components/issues/CommentsCard';
import MDEditor from '@uiw/react-md-editor';


export const IssuesTable: React.FC = () => {
  const { id: reportId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [assignedToFilter, setAssignedToFilter] = useState('all');
  const [selectedBugs, setSelectedBugs] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusModal, setStatusModal] = useState<{ bugId: number; status: number; severity: number } | null>(null);
  const [selectedBugId, setSelectedBugId] = useState<number | null>(null);
  const [issueDetailsHeight, setIssueDetailsHeight] = useState<number>(0);
  const [newComment, setNewComment] = useState('');

  // Validate reportId
  if (!reportId || isNaN(parseInt(reportId))) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Invalid report ID</p>
          <Button asChild>
            <Link to="/reports">Back to Reports</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { data, isLoading, error } = useBugs(parseInt(reportId), {
    search: searchQuery || undefined,
    status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
    severity: severityFilter && severityFilter !== 'all' ? severityFilter : undefined,
  });

  const bugs = data?.bugs || [];

  // Get selected bug details
  const { data: selectedBug, isLoading: selectedBugLoading } = useBug(selectedBugId || 0);
  const { data: comments, isLoading: commentsLoading } = useBugComments(selectedBugId || 0);
  const { data: timeline, isLoading: timelineLoading } = useBugTimeline(selectedBugId || 0);
  const createCommentMutation = useCreateComment();

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBugs(bugs.map(bug => bug.id));
    } else {
      setSelectedBugs([]);
    }
  };

  const handleSelectBug = (bugId: number, checked: boolean) => {
    if (checked) {
      setSelectedBugs(prev => [...prev, bugId]);
    } else {
      setSelectedBugs(prev => prev.filter(id => id !== bugId));
    }
  };

  const isAllSelected = bugs.length > 0 && selectedBugs.length === bugs.length;
  const isIndeterminate = selectedBugs.length > 0 && selectedBugs.length < bugs.length;

  // Helper functions
  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'unsolved': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedBugId) return;

    try {
      await createCommentMutation.mutateAsync({
        bugId: selectedBugId,
        comment: newComment.trim()
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading bugs: {error.message}</p>
          <Button asChild>
            <Link to={`/reports/${reportId}`}>Back to Report</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading issues...</p>
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
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/reports/${reportId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Report
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">All Issues ({bugs.length})</h1>
            <p className="text-muted-foreground">Manage and track all security issues</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedBugs.length > 0 && (
            <Button variant="outline" size="sm">
              Select multiple ({selectedBugs.length})
            </Button>
          )}
          <Link to={`/reports/${reportId}/bugs/add`}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Issue
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by issue name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Astra Admin">Astra Admin</SelectItem>
                  <SelectItem value="FirstUser Botsford">FirstUser Botsford</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Unsolved">Unsolved</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="severity">Severity</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Issues Table */}
        <div className="lg:col-span-7">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>CREATED BY</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>CVSS Score</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-4" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-12" />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : bugs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Bug className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-gray-500">No issues found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bugs.map((bug) => (
                      <TableRow
                        key={bug.id}
                        className={`cursor-pointer hover:bg-gray-50 ${selectedBugId === bug.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedBugId(bug.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedBugs.includes(bug.id)}
                            onCheckedChange={(checked) => handleSelectBug(bug.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-600">
                          #{bug.id.toString().slice(-8)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">{bug.title}</div>
                            <div className="text-sm text-gray-500">
                              reported by {(bug as any).reported_by || 'Unknown'} {formatDate(bug.created_at)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                              {((bug as any).created_by || (bug as any).reported_by || 'A').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm">{(bug as any).created_by || (bug as any).reported_by || 'Astra Admin'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getStatusColor(bug.status?.label || 'Open')}`}>
                            {bug.status?.label || 'Open'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityVariant(bug.severity?.label || 'Medium')} className="text-xs">
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${
                                bug.severity?.label?.toLowerCase() === 'critical' ? 'bg-red-500' :
                                bug.severity?.label?.toLowerCase() === 'high' ? 'bg-orange-500' :
                                bug.severity?.label?.toLowerCase() === 'medium' ? 'bg-yellow-500' :
                                bug.severity?.label?.toLowerCase() === 'low' ? 'bg-green-500' : 'bg-blue-500'
                              }`} />
                              {bug.severity?.label || 'Medium'}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {(bug as any).cvss_score || (bug as any).risk_score || '4.5'}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedBugId(bug.id)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                const qs = searchParams.get('selected') ? `?selected=${searchParams.get('selected')}` : '';
                                navigate(`/reports/${reportId}/bugs/${bug.id}/edit${qs}`);
                              }}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setStatusModal({ bugId: bug.id, status: bug.status?.value ?? 0, severity: bug.severity?.value ?? 0 })}
                              title="Change Status"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Issue Details, Timeline, Comments */}
        <div className="lg:col-span-5 space-y-6">
          {selectedBugId ? (
            <>
              {/* Issue Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Issue Details
                  </CardTitle>
                  <p className="text-sm text-gray-500">Bug information and Details</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedBugLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : selectedBug ? (
                    <>
                      {/* Title and Severity */}
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2 text-xl">{selectedBug.title}</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{selectedBug.status?.label || 'Open'}</Badge>
                            <Badge variant={getSeverityVariant(selectedBug.severity?.label || 'Medium')} className="px-2">{selectedBug.severity?.label || 'Medium'}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-white">
                          <div className="text-xs text-gray-500">CVSS</div>
                          <div className="text-2xl font-bold tabular-nums">{(selectedBug as any).cvss_score || (selectedBug as any).risk_score || '-'}</div>
                          {(selectedBug as any).cvss_severity && (
                            <Badge variant="outline" className="ml-1">{(selectedBug as any).cvss_severity}</Badge>
                          )}
                        </div>
                      </div>

                      {/* Meta grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">BUG ID</div>
                          <div className="text-sm font-mono">{selectedBug.bug_id || selectedBug.id}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">AFFECTED DOMAIN</div>
                          <div className="text-sm">{selectedBug.domain || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">CREATED BY</div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs flex items-center justify-center">
                              {((selectedBug as any).created_by || (selectedBug as any).reported_by || '?').split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <span className="text-sm">{(selectedBug as any).created_by || (selectedBug as any).reported_by || 'Unknown'}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">STATUS</div>
                          <div className="text-sm">{selectedBug.status?.label || 'Open'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">BUG TYPE</div>
                          <div className="text-sm">{selectedBug.type?.name || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">CREATED</div>
                          <div className="text-sm">{formatDate(selectedBug.created_at)}</div>
                        </div>
                        {(selectedBug as any).cvss_vector && (
                          <div className="col-span-2">
                            <div className="text-xs text-gray-500">CVSS VECTOR</div>
                            <div className="text-sm break-all">{(selectedBug as any).cvss_vector}</div>
                          </div>
                        )}
                      </div>

                      {/* Description, POC, Fix Tabs */}
                      <Tabs defaultValue="description" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="description">Description</TabsTrigger>
                          <TabsTrigger value="poc">POC</TabsTrigger>
                          <TabsTrigger value="fix">Fix</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="description" className="mt-4">
                          <div className="text-sm text-gray-700 max-w-none bg-white p-3 rounded border min-h-[100px]">
                            {selectedBug.description ? (
                              <>
                                {/* Debug test */}
                                <div className="issue-content mb-4 p-2 bg-yellow-100 border">
                                  <strong>Debug Test:</strong>
                                  <div className="wmde-markdown">
                                    <ol>
                                      <li>Test item 1</li>
                                      <li>Test item 2</li>
                                      <li>Test item 3</li>
                                    </ol>
                                  </div>
                                </div>
                                <div 
                                  className="issue-content" 
                                  style={{
                                    listStyleType: 'decimal',
                                    listStylePosition: 'inside'
                                  }}
                                  dangerouslySetInnerHTML={{ __html: selectedBug.description }} 
                                />
                              </>
                            ) : (
                              <p className="text-gray-500 italic">No description provided</p>
                            )}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="poc" className="mt-4">
                          <div className="text-sm text-gray-700 max-w-none bg-white p-3 rounded border min-h-[100px]">
                            {selectedBug.poc ? (
                              <div 
                                className="issue-content" 
                                style={{
                                  listStyleType: 'decimal',
                                  listStylePosition: 'inside'
                                }}
                                dangerouslySetInnerHTML={{ __html: selectedBug.poc }} 
                              />
                            ) : (
                              <p className="text-gray-500 italic">No proof of concept provided</p>
                            )}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="fix" className="mt-4">
                          <div className="text-sm text-gray-700 max-w-none bg-white p-3 rounded border min-h-[100px]">
                            {selectedBug.fix ? (
                              <div 
                                className="issue-content" 
                                style={{
                                  listStyleType: 'decimal',
                                  listStylePosition: 'inside'
                                }}
                                dangerouslySetInnerHTML={{ __html: selectedBug.fix }} 
                              />
                            ) : (
                              <p className="text-gray-500 italic">No fix provided</p>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Select an issue to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-red-500" />
                    Timeline
                  </CardTitle>
                  <p className="text-sm text-gray-500">Issue timeline</p>
                </CardHeader>
                <CardContent>
                  {timelineLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Skeleton className="h-3 w-3 rounded-full mt-1" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : timeline && timeline.length > 0 ? (
                    <div className="space-y-4">
                      {timeline.map((item: any, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{item.title || 'Timeline Event'}</p>
                            <p className="text-sm text-gray-600">{item.description || 'No description'}</p>
                            <p className="text-xs text-gray-500">{formatDate(item.created_at || item.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No timeline events found</p>
                  )}
                </CardContent>
              </Card>

              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments ({comments?.length || 0})
                  </CardTitle>
                  <p className="text-sm text-gray-500">Post your comments</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {commentsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : comments && comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment: any) => (
                        <div key={comment.id} className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium flex-shrink-0">
                            {(comment.user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{comment.user?.name || 'Unknown User'}</p>
                              <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                            </div>
                            <div className="prose prose-sm max-w-none">
                              <div dangerouslySetInnerHTML={{ __html: comment.content }} />
                            </div>
                            {comment.attachments && comment.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {comment.attachments.map((attachment: any, index: number) => (
                                  <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                                    <Paperclip className="h-3 w-3" />
                                    <span>{attachment.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No comments yet</p>
                      <p className="text-sm text-gray-400 mt-2">Be the first to add a comment</p>
                    </div>
                  )}

                  {/* Add Comment Form */}
                  <div className="border-t pt-6">
                    <form onSubmit={handleSubmitComment} className="space-y-4">
                      <div>
                        <label htmlFor="comment" className="text-sm font-medium text-gray-700">
                          Add a comment
                        </label>
                        <Textarea
                          id="comment"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write your comment here..."
                          className="mt-1 min-h-[100px]"
                          disabled={createCommentMutation.isPending}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={createCommentMutation.isPending}
                          >
                            <Paperclip className="h-4 w-4 mr-2" />
                            Attach
                          </Button>
                        </div>
                        <Button
                          type="submit"
                          disabled={!newComment.trim() || createCommentMutation.isPending}
                        >
                          {createCommentMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Posting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Post Comment
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Bug className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select an issue to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {bugs.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {bugs.length} of {bugs.length} issues
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusModal && (
        <StatusChangeModal
          isOpen={!!statusModal}
          onClose={() => setStatusModal(null)}
          bugId={statusModal.bugId}
          currentStatus={statusModal.status}
          currentSeverity={statusModal.severity}
        />
      )}
    </div>
  );
};

export default IssuesTable;
