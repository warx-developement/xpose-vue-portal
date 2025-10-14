import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, FileText, Users, Calendar, Filter, Download } from 'lucide-react';
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

const SeverityIndicator = ({ bugs_count }: { bugs_count: any }) => {
  const total = bugs_count?.total || 0;

  const severities = [
    { key: 'Critical', color: 'bg-red-500', count: bugs_count?.Critical || 0 },
    { key: 'High', color: 'bg-orange-500', count: bugs_count?.High || 0 },
    { key: 'Medium', color: 'bg-yellow-500', count: bugs_count?.Medium || 0 },
    { key: 'Low', color: 'bg-blue-500', count: bugs_count?.Low || 0 },
    { key: 'Info', color: 'bg-gray-400', count: bugs_count?.Info || 0 },
  ];

  // Calculate grade based on severity distribution
  const criticalCount = bugs_count?.Critical || 0;
  const highCount = bugs_count?.High || 0;
  const mediumCount = bugs_count?.Medium || 0;
  const lowCount = bugs_count?.Low || 0;
  
  // Grade calculation: A (best) to F (worst)
  let grade = 'A';
  let gradeColor = 'text-green-600';
  let numberColor = 'text-green-600';
  
  if (total === 0) {
    grade = 'A';
    gradeColor = 'text-green-600';
    numberColor = 'text-green-600';
  } else if (criticalCount > 0) {
    grade = 'F';
    gradeColor = 'text-red-600';
    numberColor = 'text-red-600';
  } else if (highCount >= 3) {
    grade = 'D';
    gradeColor = 'text-orange-600';
    numberColor = 'text-orange-600';
  } else if (highCount >= 1 || mediumCount >= 5) {
    grade = 'C';
    gradeColor = 'text-yellow-600';
    numberColor = 'text-yellow-600';
  } else if (mediumCount >= 1 || lowCount >= 3) {
    grade = 'B';
    gradeColor = 'text-blue-600';
    numberColor = 'text-blue-600';
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`text-4xl font-bold ${numberColor}`}>{total}</div>
      <div className="text-sm font-medium text-gray-600 hidden lg:block">Total</div>
      <div className={`text-sm font-semibold ${gradeColor}`}>{grade} Grade</div>
    </div>
  );
};

const ReportCard = ({ report, onDelete, onGenerate }: { 
  report: any; 
  onDelete: (id: number, name: string) => void; 
  onGenerate: (id: number) => void;
}) => {

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => window.location.href = `/reports/${report.id}`}>
      <CardContent className="p-4">
        {/* Mobile Layout - Stacked */}
        <div className="block lg:hidden space-y-4">
          {/* Top Row - Grade and Name */}
          <div className="flex items-start justify-between">
            <div className="flex-shrink-0 w-16">
              <SeverityIndicator bugs_count={report.bugs_count} />
            </div>
            <div className="flex-1 min-w-0 ml-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {report.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {report.scope}
              </p>
            </div>
          </div>

          {/* Middle Row - Severity Breakdown */}
          <div className="flex gap-1.5 justify-center">
            <div className="bg-red-50 border border-red-200 rounded-md p-1.5 text-center min-w-[45px] flex-shrink-0">
              <div className="text-xs font-bold text-red-600">{report.bugs_count?.Critical || 0}</div>
              <div className="text-[10px] font-medium text-red-600">Critical</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-md p-1.5 text-center min-w-[45px] flex-shrink-0">
              <div className="text-xs font-bold text-orange-600">{report.bugs_count?.High || 0}</div>
              <div className="text-[10px] font-medium text-orange-600">High</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-1.5 text-center min-w-[45px] flex-shrink-0">
              <div className="text-xs font-bold text-yellow-600">{report.bugs_count?.Medium || 0}</div>
              <div className="text-[10px] font-medium text-yellow-600">Medium</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-md p-1.5 text-center min-w-[45px] flex-shrink-0">
              <div className="text-xs font-bold text-green-600">{report.bugs_count?.Low || 0}</div>
              <div className="text-[10px] font-medium text-green-600">Low</div>
            </div>
          </div>

          {/* Bottom Row - Team Access, Actions, and Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-1">
                {report.access?.length > 0 ? (
                  <UserAvatars users={report.access} />
                ) : (
                  <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium border-2 border-background">
                    <Users className="h-3 w-3" />
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500">Team Access</span>
            </div>
            
            <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 hover:bg-gray-100">
                <Link to={`/reports/${report.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 hover:bg-gray-100">
                <Link to={`/reports/${report.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onGenerate(report.id)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                title="Generate PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(report.id, report.name)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Date Row */}
          <div className="text-xs text-gray-400 text-center">
            Created: {new Date(report.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Desktop Layout - Original */}
        <div className="hidden lg:flex items-center justify-between">
          {/* Section 1 - Grade */}
          <div className="flex-shrink-0 w-20">
            <SeverityIndicator bugs_count={report.bugs_count} />
          </div>

          {/* Section 2 - Name and Description */}
          <div className="flex-1 min-w-0 mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {report.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">
              {report.scope}
            </p>
            
            {/* Team Access */}
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-1">
                {report.access?.length > 0 ? (
                  <UserAvatars users={report.access} />
                ) : (
                  <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium border-2 border-background">
                    <Users className="h-3 w-3" />
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500">Team Access</span>
            </div>
          </div>

          {/* Section 3 - Severity Breakdown Grid (One Line) */}
          <div className="flex-shrink-0 mx-4">
            <div className="flex gap-1">
              <div className="bg-red-50 border border-red-200 rounded-md p-2 text-center min-w-[50px]">
                <div className="text-sm font-bold text-red-600">{report.bugs_count?.Critical || 0}</div>
                <div className="text-xs font-medium text-red-600">Critical</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-md p-2 text-center min-w-[50px]">
                <div className="text-sm font-bold text-orange-600">{report.bugs_count?.High || 0}</div>
                <div className="text-xs font-medium text-orange-600">High</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 text-center min-w-[50px]">
                <div className="text-sm font-bold text-yellow-600">{report.bugs_count?.Medium || 0}</div>
                <div className="text-xs font-medium text-yellow-600">Medium</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-md p-2 text-center min-w-[50px]">
                <div className="text-sm font-bold text-green-600">{report.bugs_count?.Low || 0}</div>
                <div className="text-xs font-medium text-green-600">Low</div>
              </div>
            </div>
          </div>

          {/* Section 4 - Actions */}
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 hover:bg-gray-100">
                  <Link to={`/reports/${report.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 hover:bg-gray-100">
                  <Link to={`/reports/${report.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onGenerate(report.id)}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  title="Generate PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(report.id, report.name)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {/* Created date below actions */}
              <div className="text-xs text-gray-400">
                Created: {new Date(report.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Security Reports</h1>
            <p className="text-muted-foreground">
              Manage and monitor your security assessment reports
            </p>
          </div>
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

      {/* Reports Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: pageSize }).map((_, i) => (
            <Card key={i} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-shrink-0 w-20">
                    <div className="flex flex-col items-center space-y-2">
                      <Skeleton className="h-10 w-10 rounded" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 mx-4">
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-48 mb-2" />
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-1">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <Skeleton key={j} className="h-6 w-6 rounded-full" />
                        ))}
                      </div>
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <div className="flex-shrink-0 mx-4">
                    <div className="flex gap-1">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <Skeleton key={j} className="h-12 w-12 rounded-md" />
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <Skeleton key={j} className="h-8 w-8" />
                        ))}
                      </div>
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : data?.reports?.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchQuery ? 'No reports found' : 'No reports yet'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? 'No reports found matching your search.' : 'Get started by creating your first security report.'}
                    </p>
                    {!searchQuery && (
                      <Button asChild>
                        <Link to="/reports/add">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Report
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          data.reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDelete={handleDeleteReport}
              onGenerate={handleGenerateReport}
            />
          ))
        )}
      </div>

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