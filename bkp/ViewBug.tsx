import React, { useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Edit, Settings, Clock, MessageSquare, FileText, BarChart3, Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useBug, useBugComments, useBugTimeline, useCreateComment } from '@/hooks/useBugs';
import { StatusChangeModal } from '@/components/StatusChangeModal';

export const ViewBug: React.FC = () => {
  const { reportId, bugId } = useParams<{ reportId: string; bugId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');

  const { data: bug, isLoading, error } = useBug(parseInt(bugId!));
  const { data: comments, isLoading: commentsLoading } = useBugComments(parseInt(bugId!));
  const { data: timeline, isLoading: timelineLoading } = useBugTimeline(parseInt(bugId!));
  const createCommentMutation = useCreateComment();

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'under review': return 'bg-blue-100 text-blue-800';
      case 'unsolved': return 'bg-gray-100 text-gray-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        bugId: parseInt(bugId!),
        comment: newComment.trim()
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-10 w-64" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-6" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !bug) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading bug details</p>
            <Button asChild>
              <Link to={`/reports/${reportId}/bugs`}>Back to Issues</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/reports/${reportId}/bugs${searchParams.get('selected') ? `?selected=${searchParams.get('selected')}` : ''}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Issues
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{bug.title}</h1>
            <p className="text-muted-foreground">Issue #{bug.id.toString().slice(-8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsStatusModalOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Change Status
          </Button>
          <Button asChild>
            <Link to={`/reports/${reportId}/bugs/${bug.id}/edit${searchParams.get('selected') ? `?selected=${searchParams.get('selected')}` : ''}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Issue
            </Link>
          </Button>
        </div>
      </div>

      {/* Issue Details - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Issue Details
          </CardTitle>
          <p className="text-sm text-gray-500">Bug information and Details</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title and Severity */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2 text-xl">{bug.title}</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{bug.status?.label || 'Open'}</Badge>
                <Badge className={`px-2 ${getSeverityColor(bug.severity?.label || 'Medium')}`}>{bug.severity?.label || 'Medium'}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-white">
              <div className="text-xs text-gray-500">CVSS</div>
              <div className="text-2xl font-bold tabular-nums">{(bug as any).cvss_score || (bug as any).risk_score || '-'}</div>
              {(bug as any).cvss_severity && (
                <Badge variant="outline" className="ml-1">{(bug as any).cvss_severity}</Badge>
              )}
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500">BUG ID</div>
              <div className="text-sm font-mono">{bug.bug_id || bug.id}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">AFFECTED DOMAIN</div>
              <div className="text-sm">{bug.domain || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">CREATED BY</div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs flex items-center justify-center">
                  {((bug as any).created_by || (bug as any).reported_by || '?').split(' ').map((n: string) => n[0]).join('')}
                </div>
                <span className="text-sm">{(bug as any).created_by || (bug as any).reported_by || 'Unknown'}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">STATUS</div>
              <div className="text-sm">{bug.status?.label || 'Open'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">BUG TYPE</div>
              <div className="text-sm">{bug.type?.name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">CREATED</div>
              <div className="text-sm">{formatDate(bug.created_at)}</div>
            </div>
            {(bug as any).cvss_vector && (
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">CVSS VECTOR</div>
                <div className="text-sm break-all">{(bug as any).cvss_vector}</div>
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
                {bug.description ? (
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: bug.description }} />
                ) : (
                  <p className="text-gray-500 italic">No description provided</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="poc" className="mt-4">
              <div className="text-sm text-gray-700 max-w-none bg-white p-3 rounded border min-h-[100px]">
                {bug.poc ? (
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: bug.poc }} />
                ) : (
                  <p className="text-gray-500 italic">No proof of concept provided</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="fix" className="mt-4">
              <div className="text-sm text-gray-700 max-w-none bg-white p-3 rounded border min-h-[100px]">
                {bug.fix ? (
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: bug.fix }} />
                ) : (
                  <p className="text-gray-500 italic">No fix provided</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Timeline and Comments - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-4">
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
        </div>

        {/* Comments */}
        <div className="lg:col-span-8">
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
        </div>
      </div>

      {/* Status Change Modal */}
      {bug && (
        <StatusChangeModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          bugId={parseInt(bugId!)}
          currentStatus={bug.status?.value || 0}
          currentSeverity={bug.severity?.value || 0}
        />
      )}
    </div>
  );
};

export default ViewBug;