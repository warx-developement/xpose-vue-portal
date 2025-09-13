import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, FileText, Users, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
// Removed AddReportModal usage in favor of AddReport page
import { useReports, useCreateReport, useDeleteReport } from '@/hooks/useReports';

const VulnerabilityProgressBar = ({ bugs_count }: { bugs_count: any }) => {
  const total = bugs_count?.total || 0;
  if (total === 0) return <span className="text-sm text-muted-foreground">No vulnerabilities</span>;

  const severities = [
    { key: 'Critical', color: 'bg-red-500', count: bugs_count?.Critical || 0 },
    { key: 'High', color: 'bg-orange-500', count: bugs_count?.High || 0 },
    { key: 'Medium', color: 'bg-yellow-500', count: bugs_count?.Medium || 0 },
    { key: 'Low', color: 'bg-blue-500', count: bugs_count?.Low || 0 },
    { key: 'Info', color: 'bg-gray-400', count: bugs_count?.Info || 0 },
  ];

  return (
    <div className="space-y-2">
      <div className="flex h-2 bg-gray-100 rounded-full overflow-hidden">
        {severities.map((severity) => {
          const width = (severity.count / total) * 100;
          return width > 0 ? (
            <div
              key={severity.key}
              className={severity.color}
              style={{ width: `${width}%` }}
            />
          ) : null;
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span className="text-gray-600">Total: {total}</span>
        {severities.map((severity) => 
          severity.count > 0 ? (
            <span key={severity.key} className="text-gray-600">
              {severity.key}: {severity.count}
            </span>
          ) : null
        )}
      </div>
    </div>
  );
};

const UserAvatars = ({ users, maxShow = 3 }: { users: any[]; maxShow?: number }) => {
  const displayUsers = users.slice(0, maxShow);
  const remaining = users.length - maxShow;

  return (
    <div className="flex -space-x-2">
      {displayUsers.map((user) => (
        <div
          key={user.id}
          className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-medium border-2 border-background"
          title={user.name}
        >
          {user.name.split(' ').map((n: string) => n[0]).join('')}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border-2 border-background"
          title={`+${remaining} more users`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export const ListReports: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch reports with search and pagination
  const { data, isLoading, error } = useReports({
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const createReportMutation = useCreateReport();
  const deleteReportMutation = useDeleteReport();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCreateReport = (data: { name: string; scope: string; userAccess: any[] }) => {
    createReportMutation.mutate(data, {
      onSuccess: () => {
        setIsAddModalOpen(false);
      }
    });
  };

  const handleDeleteReport = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteReportMutation.mutate(id);
    }
  };

  const handleGenerateReport = (reportId: number) => {
    // Navigate to the generate report page
    window.location.href = `/reports/${reportId}/generate`;
  };


  const totalPages = Math.ceil((data?.pagination?.total || 0) / pageSize);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading reports</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Reports</h1>
          <p className="text-muted-foreground">
            Manage and monitor your security assessment reports
          </p>
        </div>
        <Button asChild className="flex items-center gap-2">
          <Link to="/reports/add">
          <Plus className="h-4 w-4" />
          Add Report
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Team Access</TableHead>
                <TableHead>Vulnerabilities</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <Skeleton key={j} className="h-8 w-8 rounded-full" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
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
              ) : data?.reports?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchQuery ? 'No reports found matching your search.' : 'No reports yet.'}
                      </p>
                      {!searchQuery && (
                        <Button variant="outline" asChild className="mt-2">
                          <Link to="/reports/add">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Report
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.reports.map((report) => (
                  <TableRow key={report.id} className="group">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {report.scope}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.access?.length > 0 ? (
                        <UserAvatars users={report.access} />
                      ) : (
                        <span className="text-sm text-muted-foreground">No access</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <VulnerabilityProgressBar bugs_count={report.bugs_count} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/reports/${report.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/reports/${report.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateReport(report.id)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReport(report.id, report.name)}
                        >
                          <Trash2 className="h-4 w-4" />
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
      {data?.pagination && data.pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, data.pagination.total)} of{' '}
            {data.pagination.total} reports
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals: none for Add Report now */}
    </div>
  );
};