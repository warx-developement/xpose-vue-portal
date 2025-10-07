import React, { useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Bug, Edit, Settings, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBugs } from '@/hooks/useBugs';
import { StatusChangeModal } from '@/components/StatusChangeModal';

export const BugsList: React.FC = () => {
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

      {/* Issues Table */}
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
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      const qs = searchParams.get('selected') ? `?selected=${searchParams.get('selected')}` : '';
                      navigate(`/reports/${reportId}/bugs/${bug.id}/view${qs}`);
                    }}
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
                      {bug.cvss_score || 'N/A'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            const qs = searchParams.get('selected') ? `?selected=${searchParams.get('selected')}` : '';
                            navigate(`/reports/${reportId}/bugs/${bug.id}/view${qs}`);
                          }}
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

export default BugsList;
