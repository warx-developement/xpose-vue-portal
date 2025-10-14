import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Bug, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBugs, useDeleteBug } from '@/hooks/useBugs';
import { StatusChangeModal } from '@/components/StatusChangeModal';
import { useQueryClient } from '@tanstack/react-query';
import { IssueDetails } from '@/components/issues/IssueDetails';
import { TimelineCard } from '@/components/issues/TimelineCard';
import { CommentsCard } from '@/components/issues/CommentsCard';

export const ViewBug: React.FC = () => {
  const { id: reportId, bugId } = useParams<{ id: string; bugId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedBugId, setSelectedBugId] = useState<number | null>(null);
  const [issueDetailsHeight, setIssueDetailsHeight] = useState<number>(0);

  // Parse bugId from URL
  useEffect(() => {
    if (bugId && !isNaN(parseInt(bugId))) {
      setSelectedBugId(parseInt(bugId));
    }
  }, [bugId]);

  const { data, isLoading, error } = useBugs(parseInt(reportId || '0'), {});
  const bugs = data?.bugs || [];
  const deleteBugMutation = useDeleteBug();
  const [statusModal, setStatusModal] = useState<{ bugId: number; status: number } | null>(null);

  const handleEdit = (bugId: number) => {
    const qs = searchParams.get('selected') ? `?selected=${searchParams.get('selected')}` : '';
    navigate(`/reports/${reportId}/bugs/${bugId}/edit${qs}`);
  };

  const handleStatus = (bugId: number, status: number) => {
    setStatusModal({ bugId, status });
  };

  const handleDelete = async (bugId: number) => {
    if (!confirm('Delete this bug?')) return;
    try {
      await deleteBugMutation.mutateAsync(bugId);
      navigate(`/reports/${reportId}/bugs`);
    } catch (e) {}
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading bug details</p>
          <Button asChild>
            <Link to={`/reports/${reportId}/bugs`}>Back to Issues</Link>
          </Button>
        </div>
      </div>
    );
  }

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
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bug details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedBugId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Bug not found</p>
          <Button asChild>
            <Link to={`/reports/${reportId}/bugs`}>Back to Issues</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to={`/reports/${reportId}/bugs`}>
            <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-50 rounded-xl">
              <Bug className="h-5 w-5 text-orange-600" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Issue Details</h1>
            <p className="text-muted-foreground">View and manage issue details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(selectedBugId)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Edit Issue
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const currentBug = bugs.find(bug => bug.id === selectedBugId);
              setStatusModal({ bugId: selectedBugId!, status: currentBug?.status?.value || 0 });
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Change Status
          </Button>
        </div>
      </div>

      {/* Main Grid: Issue Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-12 flex min-h-0 w-full">
          <Card className="flex flex-col w-full" style={{ height: 'auto' }}>
            <IssueDetails bugId={selectedBugId} onHeightChange={setIssueDetailsHeight} />
          </Card>
        </div>
      </div>
      
      {/* Timeline and Comments: Side by side */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Timeline */}
        <div className="lg:col-span-3">
          <TimelineCard selectedBugId={selectedBugId} height={issueDetailsHeight} />
        </div>
        {/* Comments */}
        <div className="lg:col-span-9">
          <CommentsCard selectedBugId={selectedBugId} reportId={parseInt(reportId || '0')} />
        </div>
      </div>
      
      {statusModal && (
        <StatusChangeModal
          isOpen={!!statusModal}
          onClose={() => setStatusModal(null)}
          bugId={statusModal.bugId}
          currentStatus={statusModal.status}
        />
      )}
    </div>
  );
};

export default ViewBug;
