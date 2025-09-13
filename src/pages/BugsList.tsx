import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Bug, Calendar, User, FileText, Image, MessageSquare, Edit, Filter, BarChart3, Paperclip, Save, X, Trash2, Settings, Upload, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MDEditor from '@uiw/react-md-editor';

// Override markdown editor dark theme
const markdownEditorStyles = `
  .wmde-markdown {
    background-color: white !important;
    color: #374151 !important;
  }
  .wmde-markdown pre {
    background-color: #f3f4f6 !important;
    color: #1f2937 !important;
    border: 1px solid #d1d5db !important;
    border-radius: 4px !important;
    padding: 8px !important;
  }
  .wmde-markdown code {
    background-color: #f3f4f6 !important;
    color: #1f2937 !important;
    padding: 2px 4px !important;
    border-radius: 3px !important;
  }
  .wmde-markdown blockquote {
    background-color: #f9fafb !important;
    border-left: 4px solid #d1d5db !important;
    color: #374151 !important;
    padding: 8px 16px !important;
    margin: 8px 0 !important;
  }
  .wmde-markdown h1,
  .wmde-markdown h2,
  .wmde-markdown h3,
  .wmde-markdown h4,
  .wmde-markdown h5,
  .wmde-markdown h6 {
    color: #1f2937 !important;
  }
  .wmde-markdown p {
    color: #374151 !important;
  }
  /* Ensure lists are visible */
  .wmde-markdown ul,
  .wmde-markdown ol {
    margin: 0.5rem 0 0.5rem 1.25rem !important;
    padding-left: 1.25rem !important;
  }
  .wmde-markdown ul { list-style: disc !important; }
  .wmde-markdown ol { list-style: decimal !important; }
  .wmde-markdown li { display: list-item !important; margin: 0.25rem 0 !important; }
  /* Make all markdown links open in new tab */
  .wmde-markdown a {
    color: #2563eb !important;
    text-decoration: underline !important;
  }
  .wmde-markdown a:hover {
    color: #1d4ed8 !important;
  }
  /* Force all markdown links to open in new tab via CSS */
  .wmde-markdown a::after {
    content: " ↗";
    font-size: 0.8em;
    opacity: 0.7;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbars only in modal and card content areas */
  .scrollbar-hide,
  [data-radix-scroll-area-viewport],
  .overflow-y-auto {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-hide::-webkit-scrollbar,
  [data-radix-scroll-area-viewport]::-webkit-scrollbar,
  .overflow-y-auto::-webkit-scrollbar {
    display: none;
  }
`;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBugs, useBug, useBugComments, useCreateComment, useUpdateComment, useDeleteComment, useCreateBug, useUpdateBugStatus, useBugTypes, useBugTimeline, useDeleteBug, useAddCommentAttachment, useDeleteCommentAttachment, useUploadCommentDraftAttachment } from '@/hooks/useBugs';
import { DraftAttachment } from '@/lib/api';
import { StatusChangeModal } from '@/components/StatusChangeModal';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AttachmentUpload } from '@/components/ui/attachment-upload';
import { AttachmentDisplay, AttachmentGrid } from '@/components/ui/attachment-display';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { normalizeAttachment } from '@/lib/attachment-utils';

const BugListItem = ({ bug, isSelected, onClick, onEdit, onStatus, onDelete }: { 
  bug: any; 
  isSelected: boolean; 
  onClick: () => void;
  onEdit: () => void;
  onStatus: () => void;
  onDelete: () => void;
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  };

  return (
    <div 
      className={`p-4 border-b cursor-pointer hover:bg-blue-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-600">{bug.status.label}</span>
            <Badge className={`text-xs ${getSeverityColor(bug.severity.label)}`}>
              {bug.severity.label}
            </Badge>
          </div>
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
            {bug.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {bug.domain}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-gray-500">{formatDate(bug.created_at)}</div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="Edit"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="Change Status"
            onClick={(e) => { e.stopPropagation(); onStatus(); }}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const BugDetails = ({ bugId, onHeightChange }: { bugId: number | null; onHeightChange?: (height: number) => void }) => {
  const { data: bug, isLoading, error } = useBug(bugId || 0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && onHeightChange) {
      const resizeObserver = new ResizeObserver(() => {
        const height = contentRef.current?.offsetHeight || 0;
        onHeightChange(height);
      });
      
      resizeObserver.observe(contentRef.current);
      
      // Initial height measurement
      const height = contentRef.current.offsetHeight;
      onHeightChange(height);
      
      return () => resizeObserver.disconnect();
    }
  }, [bug, onHeightChange]);

  // Make all markdown links open in new tab
  useEffect(() => {
    const handleMarkdownLinks = () => {
      // Find all markdown links in the content
      const links = contentRef.current?.querySelectorAll('.wmde-markdown a') || [];
      links.forEach((link) => {
        if (!link.getAttribute('target')) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
    };

    // Global click handler for markdown links
    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A' && target.closest('.wmde-markdown')) {
        event.preventDefault();
        const href = (target as HTMLAnchorElement).href;
        if (href) {
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      }
    };

    // Run immediately
    handleMarkdownLinks();

    // Add global click listener
    document.addEventListener('click', handleClick);

    // Use MutationObserver to catch dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          handleMarkdownLinks();
        }
      });
    });

    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true
      });
    }

    // Also run with multiple timeouts as backup
    const timeoutIds = [
      setTimeout(handleMarkdownLinks, 100),
      setTimeout(handleMarkdownLinks, 500),
      setTimeout(handleMarkdownLinks, 1000)
    ];

    return () => {
      document.removeEventListener('click', handleClick);
      observer.disconnect();
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [bug]);

  if (!bugId) {
    return (
      <>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            Issue Details
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Select a bug to view issue</p>
          </div>
        </CardContent>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            Issue Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            Issue Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600">
            <p>Error loading bug details</p>
          </div>
        </CardContent>
      </>
    );
  }

  if (!bug) {
    return (
      <>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            Issue Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            <p>Bug not found</p>
          </div>
        </CardContent>
      </>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Issue details
            </CardTitle>
            <p className="text-sm text-gray-500">Details • Timeline • Attachments</p>
          </div>
        </div>
      </CardHeader>
      <CardContent ref={contentRef} className="space-y-6">
        {/* Title and chips */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">{bug.title}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{bug.status.label}</Badge>
              <Badge className={`px-2 ${getSeverityColor(bug.severity.label)}`}>{bug.severity.label}</Badge>
            </div>
          </div>
          {(true) && (
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-white">
              <div className="text-xs text-gray-500">CVSS</div>
              <div className="text-2xl font-bold tabular-nums">{bug.cvss?.score ?? '-'}</div>
              {bug.cvss?.severity && (
                <Badge variant="outline" className="ml-1">{bug.cvss.severity}</Badge>
              )}
            </div>
          )}
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-500">BUG ID</div>
            <div className="text-sm font-mono">{bug.bug_id}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">AFFECTED DOMAIN</div>
            <div className="text-sm">{bug.domain}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">CREATED BY</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs flex items-center justify-center">
                {(bug.created_by || '?').split(' ').map((n: string) => n[0]).join('')}
              </div>
              <span className="text-sm">{bug.created_by}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">STATUS</div>
            <div className="text-sm">{bug.status.label}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">BUG TYPE</div>
            <div className="text-sm">{bug.type?.name}</div>
          </div>
          {(true) && bug.cvss?.vector && (
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500">CVSS VECTOR</div>
              <div className="text-sm break-all">{bug.cvss.vector}</div>
            </div>
          )}
        </div>

        {/* Description, POC, Fix, Attachments Tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="poc">POC</TabsTrigger>
            <TabsTrigger value="fix">Fix</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-4">
            <div className="text-sm text-gray-700 max-w-none bg-white p-3 rounded border">
              <div className="[&_.w-md-editor]:bg-white [&_.w-md-editor-text]:bg-white [&_.w-md-editor-text]:text-gray-700 [&_.w-md-editor-text]:border-gray-200 [&_.w-md-editor-text]:rounded [&_.w-md-editor-text]:p-2 [&_.w-md-editor-text]:shadow-none [&_pre]:bg-gray-100 [&_pre]:text-gray-800 [&_pre]:border [&_pre]:border-gray-200 [&_pre]:rounded [&_pre]:p-2 [&_code]:bg-gray-100 [&_code]:text-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_blockquote]:bg-gray-50 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:text-gray-700">
                <MDEditor.Markdown source={bug.description} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="poc" className="mt-4">
            <div className="text-sm text-gray-700 max-w-none bg-white p-3 rounded border">
              <div className="[&_.w-md-editor]:bg-white [&_.w-md-editor-text]:bg-white [&_.w-md-editor-text]:text-gray-700 [&_.w-md-editor-text]:border-gray-200 [&_.w-md-editor-text]:rounded [&_.w-md-editor-text]:p-2 [&_.w-md-editor-text]:shadow-none [&_pre]:bg-gray-100 [&_pre]:text-gray-800 [&_pre]:border [&_pre]:border-gray-200 [&_pre]:rounded [&_pre]:p-2 [&_code]:bg-gray-100 [&_code]:text-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_blockquote]:bg-gray-50 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:text-gray-700">
                <MDEditor.Markdown source={bug.poc} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="fix" className="mt-4">
            <div className="text-sm text-gray-700 max-w-none bg-white p-3 rounded border">
              <div className="[&_.w-md-editor]:bg-white [&_.w-md-editor-text]:bg-white [&_.w-md-editor-text]:text-gray-700 [&_.w-md-editor-text]:border-gray-200 [&_.w-md-editor-text]:rounded [&_.w-md-editor-text]:p-2 [&_.w-md-editor-text]:shadow-none [&_pre]:bg-gray-100 [&_pre]:text-gray-800 [&_pre]:border [&_pre]:border-gray-200 [&_pre]:rounded [&_pre]:p-2 [&_code]:bg-gray-100 [&_code]:text-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_blockquote]:bg-gray-50 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:text-gray-700">
                <MDEditor.Markdown source={bug.fix} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="attachments" className="mt-4">
            <div className="bg-white p-3 rounded border">
              {bug.attachments && bug.attachments.length > 0 ? (
                <div className="space-y-2">
                  {bug.attachments.map((attachment) => (
                    <AttachmentDisplay
                      key={attachment.id}
                      attachment={attachment}
                      showActions={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Paperclip className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No attachments</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  );
};

// Timeline Card Component
const TimelineCard = ({ selectedBugId, height }: { selectedBugId: number | null; height?: number }) => {
  const { data: bug, isLoading: bugLoading } = useBug(selectedBugId || 0);
  const { data: timeline, isLoading: timelineLoading, error: timelineError } = useBugTimeline(selectedBugId || 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="flex flex-col" style={{ height: selectedBugId ? (height ? `${height + 100}px` : 'auto') : '750px' }}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-red-500" />
          Timeline
        </CardTitle>
        <p className="text-sm text-gray-500">Issue timeline</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {selectedBugId ? (
          bugLoading || timelineLoading ? (
            <div className="flex-1 flex flex-col space-y-4 min-h-0">
              {/* Timeline Loading Skeleton */}
              <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
                <div className="space-y-4 p-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mt-1"></div>
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : timelineError ? (
            <div className="text-center text-gray-500 py-8">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Error loading timeline</p>
            </div>
          ) : bug && timeline ? (
            <div className="flex-1 flex flex-col space-y-4 min-h-0">
              {/* Timeline Content */}
              <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
                <div className="space-y-4 p-1">
                {timeline.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No timeline yet</p>
                  </div>
                ) : (
                  timeline.map((item, idx) => {
                    const dotColor = item.type === 'created' ? 'bg-blue-500' : item.type === 'system' ? 'bg-green-500' : 'bg-yellow-500';
                    const sevClass = (label: string) => {
                      const s = label.toLowerCase();
                      if (s === 'critical') return 'bg-red-100 text-red-800';
                      if (s === 'high') return 'bg-orange-100 text-orange-800';
                      if (s === 'medium') return 'bg-yellow-100 text-yellow-800';
                      if (s === 'low') return 'bg-green-100 text-green-800';
                      return 'bg-gray-100 text-gray-800';
                    };
                    const statusClass = (label: string) => {
                      const s = label.toLowerCase();
                      if (s === 'open') return 'bg-gray-100 text-gray-800';
                      if (s === 'pending') return 'bg-blue-100 text-blue-800';
                      if (s === 'accepted') return 'bg-green-100 text-green-800';
                      if (s === 'needs' || s === 'needs more info') return 'bg-cyan-100 text-cyan-800';
                      if (s === 'retesting') return 'bg-purple-100 text-purple-800';
                      if (s === 'resolved') return 'bg-gray-200 text-gray-900';
                      if (s === "won't" || s === "won't fix" || s === 'wont' || s === 'wont fix') return 'bg-gray-100 text-gray-800';
                      return 'bg-gray-100 text-gray-800';
                    };
                    const severityMatch = /Changed\s+severity\s+from\s+(\w+)\s+to\s+(\w+)/i.exec(item.title || '');
                    const statusMatch = /(?:Changed\s+status\s+from\s+)?([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+)/i.exec(item.title || '');
                    const isSeverityChange = item.type === 'system' && !!severityMatch;
                    const isStatusChange = item.type === 'system' && !!statusMatch && !isSeverityChange;
                    const isComment = item.type === 'comment';
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`w-3 h-3 ${dotColor} rounded-full mt-1`}></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(item.time)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {isComment ? (
                              <>
                                <span className="font-medium">{item.actor}</span> added a comment
                              </>
                            ) : isStatusChange ? (
                              <>
                                <span className="font-medium">{item.actor}</span> Changed status from{' '}
                                <Badge className={`px-2 py-0.5 ${statusClass(statusMatch![1].trim())} hover:bg-inherit hover:text-inherit`}>{statusMatch![1].trim()}</Badge>{' '}to{' '}
                                <Badge className={`px-2 py-0.5 ${statusClass(statusMatch![2].trim())} hover:bg-inherit hover:text-inherit`}>{statusMatch![2].trim()}</Badge>
                              </>
                            ) : isSeverityChange ? (
                              <>
                                <span className="font-medium">{item.actor}</span> Changed severity from{' '}
                                <Badge className={`px-2 py-0.5 ${sevClass(severityMatch![1])} hover:bg-inherit hover:text-inherit`}>{severityMatch![1]}</Badge>{' '}to{' '}
                                <Badge className={`px-2 py-0.5 ${sevClass(severityMatch![2])} hover:bg-inherit hover:text-inherit`}>{severityMatch![2]}</Badge>
                              </>
                            ) : (
                              <>
                                <span className="font-medium">{item.actor}</span> {item.title}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          ) : null
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Select a bug to view timeline</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Comments Card Component
const CommentsCard = ({ selectedBugId, reportId }: { selectedBugId: number | null; reportId: number }) => {
  const { data: comments, isLoading: commentsLoading } = useBugComments(selectedBugId || 0);
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const addCommentAttachmentMutation = useAddCommentAttachment();
  const deleteCommentAttachmentMutation = useDeleteCommentAttachment();
  const uploadCommentDraftAttachmentMutation = useUploadCommentDraftAttachment();
  const { toast } = useToast();
  
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState('');
  
  // Attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingToCommentId, setUploadingToCommentId] = useState<number | null>(null);
  const [draftAttachments, setDraftAttachments] = useState<DraftAttachment[]>([]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Make all markdown links in comments open in new tab
  useEffect(() => {
    const handleMarkdownLinks = () => {
      const links = document.querySelectorAll('.wmde-markdown a');
      links.forEach((link) => {
        if (!link.getAttribute('target')) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
    };

    // Global click handler for markdown links
    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A' && target.closest('.wmde-markdown')) {
        event.preventDefault();
        const href = (target as HTMLAnchorElement).href;
        if (href) {
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      }
    };

    // Run immediately
    handleMarkdownLinks();

    // Add global click listener
    document.addEventListener('click', handleClick);

    // Use MutationObserver to catch dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          handleMarkdownLinks();
        }
      });
    });

    // Observe the entire document for markdown content changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also run with multiple timeouts as backup
    const timeoutIds = [
      setTimeout(handleMarkdownLinks, 100),
      setTimeout(handleMarkdownLinks, 500),
      setTimeout(handleMarkdownLinks, 1000)
    ];

    return () => {
      document.removeEventListener('click', handleClick);
      observer.disconnect();
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [comments]);

  const handleCreateComment = async () => {
    if (!newComment.trim() || !selectedBugId) return;
    
    try {
      const result = await createCommentMutation.mutateAsync({
        bugId: selectedBugId,
        comment: newComment,
        attachment_ids: draftAttachments.length > 0 ? draftAttachments.map(att => parseInt(att.id.toString())) : undefined
      });
      
      setNewComment('');
      setDraftAttachments([]);
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editingComment.trim()) return;
    
    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        comment: editingComment
      });
      setEditingCommentId(null);
      setEditingComment('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const startEditing = (commentId: number, currentComment: string) => {
    setEditingCommentId(commentId);
    setEditingComment(currentComment);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingComment('');
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await deleteCommentMutation.mutateAsync(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleFileSelect = async (file: File, commentId?: number) => {
    if (commentId) {
      // For existing comments, use regular attachment upload
      setSelectedFile(file);
      setUploadingToCommentId(commentId);
    } else {
      // For new comments, upload as draft attachment immediately
      setSelectedFile(file);
      try {
        const draftAttachment = await uploadCommentDraftAttachmentMutation.mutateAsync({
          reportId: reportId,
          file: file
        });
        setDraftAttachments(prev => [...prev, draftAttachment]);
        setSelectedFile(null); // Clear selected file since it's now uploaded as draft
      } catch (error) {
        console.error('Error uploading draft attachment:', error);
        setSelectedFile(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadingToCommentId(null);
    // Remove the last uploaded draft attachment if it exists
    if (draftAttachments.length > 0 && !uploadingToCommentId) {
      setDraftAttachments(prev => prev.slice(0, -1));
    }
  };

  const handleRemoveDraftAttachment = (attachmentId: string | number) => {
    setDraftAttachments(prev => prev.filter(att => att.id != attachmentId));
  };

  const handleCopyMarkdown = async (markdownLink: string, isImage: boolean) => {
    try {
      await navigator.clipboard.writeText(markdownLink);
      toast({
        title: 'Markdown copied!',
        description: isImage ? 'Image markdown copied to clipboard' : 'File link markdown copied to clipboard',
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = markdownLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: 'Markdown copied!',
        description: isImage ? 'Image markdown copied to clipboard' : 'File link markdown copied to clipboard',
      });
    }
  };

  const handleUploadCommentAttachment = async (commentId: number) => {
    if (selectedFile) {
      try {
        await addCommentAttachmentMutation.mutateAsync({
          commentId,
          file: selectedFile
        });
        setSelectedFile(null);
        setUploadingToCommentId(null);
      } catch (error) {
        console.error('Error uploading attachment:', error);
      }
    }
  };

  const handleDeleteCommentAttachment = async (commentId: number, attachmentId: number) => {
    try {
      await deleteCommentAttachmentMutation.mutateAsync({
        commentId,
        attachmentId
      });
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  // Clear selected file when upload is successful
  React.useEffect(() => {
    if (addCommentAttachmentMutation.isSuccess) {
      setSelectedFile(null);
      setUploadingToCommentId(null);
    }
  }, [addCommentAttachmentMutation.isSuccess]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-green-500" />
          Comments
        </CardTitle>
        <p className="text-sm text-gray-500">Post your comments</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {selectedBugId ? (
          <div className="flex flex-col space-y-4 min-h-0">
            {/* Existing Comments */}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
              <div className="space-y-3 p-1">
              {commentsLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          {comment.user_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-sm">{comment.user_name}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => startEditing(comment.id, comment.comment)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.png,.jpg,.jpeg,.gif,.bmp,.webp,.mp4,.avi,.mov,.wmv,.flv,.webm,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.tar,.gz';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                handleFileSelect(file, comment.id);
                              }
                            };
                            input.click();
                          }}
                          title="Add attachment to this comment"
                        >
                          <Paperclip className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deleteCommentMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {editingCommentId === comment.id ? (
                      <div className="space-y-2">
                        <MDEditor
                          value={editingComment}
                          onChange={(val) => setEditingComment(val || '')}
                          height={180}
                          data-color-mode="light"
                          preview="edit"
                          hideToolbar={false}
                          style={{ backgroundColor: '#ffffff' }}
                        />
                        
                        {/* Existing Attachments in Edit Mode */}
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">Existing Attachments:</h4>
                            <div className="space-y-1">
                              {comment.attachments.map((attachment) => {
                                const normalizedAttachment = normalizeAttachment(attachment);
                                const filename = normalizedAttachment.filename;
                                const isImage = normalizedAttachment.type?.startsWith('image/') || 
                                  /\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(filename);
                                const markdownLink = isImage 
                                  ? `![${filename}](${normalizedAttachment.image_url})` 
                                  : `[${filename}](${normalizedAttachment.image_url})`;

                                return (
                                  <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                    <span className="text-sm text-gray-700">{filename}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCopyMarkdown(markdownLink, isImage)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      Copy
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Attachment Upload for Editing Comment */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.png,.jpg,.jpeg,.gif,.bmp,.webp,.mp4,.avi,.mov,.wmv,.flv,.webm,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.tar,.gz';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    handleFileSelect(file, comment.id);
                                  }
                                };
                                input.click();
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Paperclip className="h-4 w-4 mr-1" />
                              Add Attachment
                            </Button>
                            {selectedFile && uploadingToCommentId === comment.id && (
                              <span className="text-xs text-gray-600">
                                {selectedFile.name} selected
                              </span>
                            )}
                          </div>
                          {selectedFile && uploadingToCommentId === comment.id && (
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleRemoveFile}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleUploadCommentAttachment(comment.id)}
                                disabled={addCommentAttachmentMutation.isPending}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                {addCommentAttachmentMutation.isPending ? 'Uploading...' : 'Upload'}
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleUpdateComment(comment.id)}
                            disabled={updateCommentMutation.isPending}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelEditing}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-700 max-w-none bg-white p-2 rounded border">
                          <div className="[&_.w-md-editor]:bg-white [&_.w-md-editor-text]:bg-white [&_.w-md-editor-text]:text-gray-700 [&_.w-md-editor-text]:border-gray-200 [&_.w-md-editor-text]:rounded [&_.w-md-editor-text]:p-2 [&_.w-md-editor-text]:shadow-none [&_pre]:bg-gray-100 [&_pre]:text-gray-800 [&_pre]:border [&_pre]:border-gray-200 [&_pre]:rounded [&_pre]:p-2 [&_code]:bg-gray-100 [&_code]:text-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_blockquote]:bg-gray-50 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:text-gray-700">
                            <MDEditor.Markdown source={comment.comment} />
                          </div>
                        </div>
                        
                        {/* Comment Attachments */}
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div>
                            <AttachmentGrid
                              attachments={comment.attachments}
                              onDelete={(attachmentId) => handleDeleteCommentAttachment(comment.id, attachmentId)}
                              showActions={true}
                            />
                          </div>
                        )}
                        
                        {/* Upload Attachment to Existing Comment */}
                        {selectedFile && uploadingToCommentId === comment.id && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                  {selectedFile.name}
                                </span>
                                <span className="text-xs text-blue-600">
                                  ({Math.round(selectedFile.size / 1024)} KB)
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleRemoveFile}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handleUploadCommentAttachment(comment.id)}
                                  disabled={addCommentAttachmentMutation.isPending}
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  {addCommentAttachmentMutation.isPending ? 'Uploading...' : 'Upload'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No comments yet</p>
                </div>
              )}
              </div>
            </div>

            {/* Comment Box at Bottom */}
            <div className="flex-shrink-0">
              <h4 className="font-medium text-gray-900 mb-2">Post Comments</h4>
              <div className="border rounded-lg overflow-hidden">
                <MDEditor
                  value={newComment}
                  onChange={(val) => setNewComment(val || '')}
                  height={200}
                  data-color-mode="light"
                  preview="edit"
                  hideToolbar={false}
                  style={{ backgroundColor: '#ffffff' }}
                />
                <div className="border-t p-3 bg-blue-50">
                  {/* Attachment Upload for New Comment */}
                  {!uploadingToCommentId && (
                    <div className="mb-3">
                      <AttachmentUpload
                        onFileSelect={handleFileSelect}
                        onRemove={handleRemoveFile}
                        isUploading={uploadCommentDraftAttachmentMutation.isPending}
                        uploadProgress={uploadProgress}
                        maxSize={10}
                        selectedFile={selectedFile}
                      />
                      
                      {/* Show uploaded draft attachments */}
                      {draftAttachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">Uploaded attachments:</p>
                          {draftAttachments.map((attachment) => (
                            <AttachmentDisplay
                              key={attachment.id}
                              attachment={attachment}
                              onDelete={() => handleRemoveDraftAttachment(attachment.id)}
                              showActions={true}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Markdown supported
                    </span>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleCreateComment}
                        disabled={!newComment.trim() || createCommentMutation.isPending}
                      >
                        {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Select a bug to view comments</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// CVSS Calculator Component
const CVSSCalculator = ({ 
  cvssData, 
  onUpdate 
}: { 
  cvssData: {
    attackVector: string;
    attackComplexity: string;
    privilegesRequired: string;
    userInteraction: string;
    scope: string;
    confidentiality: string;
    integrity: string;
    availability: string;
  };
  onUpdate: (data: any) => void;
}) => {
  const calculateCVSS = () => {
    // CVSS 3.1 Base Score calculation - Correct Formula
    
    // Step 1: Impact Sub-Score Calculation
    // 1.1 Impact Subscore (ISS)
    const confidentiality = getConfidentialityImpact();
    const integrity = getIntegrityImpact();
    const availability = getAvailabilityImpact();
    
    const ISS = 1 - ((1 - confidentiality) * (1 - integrity) * (1 - availability));
    
    // 1.2 Impact
    let impact;
    if (cvssData.scope === 'U') {
      // Scope = Unchanged
      impact = 6.42 * ISS;
    } else {
      // Scope = Changed
      impact = 7.52 * (ISS - 0.029) - 3.25 * Math.pow((ISS - 0.02), 15);
    }
    
    // Step 2: Exploitability Subscore
    const exploitability = 8.22 * getAttackVector() * getAttackComplexity() * getPrivilegesRequired() * getUserInteraction();
    
    // Step 3: Base Score Calculation
    let baseScore;
    if (impact <= 0) {
      baseScore = 0;
    } else {
      if (cvssData.scope === 'U') {
        // Scope = Unchanged
        baseScore = Math.min(impact + exploitability, 10);
      } else {
        // Scope = Changed
        baseScore = Math.min(1.08 * (impact + exploitability), 10);
      }
    }
    
    // Round up to nearest 0.1
    baseScore = Math.ceil(baseScore * 10) / 10;
    
    const severity = getSeverity(baseScore);
    const vector = `CVSS:3.1/AV:${cvssData.attackVector}/AC:${cvssData.attackComplexity}/PR:${cvssData.privilegesRequired}/UI:${cvssData.userInteraction}/S:${cvssData.scope}/C:${cvssData.confidentiality}/I:${cvssData.integrity}/A:${cvssData.availability}`;
    
    return { score: baseScore, severity, vector };
  };

  const getAttackVector = () => {
    switch (cvssData.attackVector) {
      case 'N': return 0.85;
      case 'A': return 0.62;
      case 'L': return 0.55;
      case 'P': return 0.2;
      default: return 0.85;
    }
  };

  const getAttackComplexity = () => {
    switch (cvssData.attackComplexity) {
      case 'L': return 0.77;
      case 'H': return 0.44;
      default: return 0.77;
    }
  };

  const getPrivilegesRequired = () => {
    switch (cvssData.privilegesRequired) {
      case 'N': return 0.85; // None - same for both scopes
      case 'L': return cvssData.scope === 'U' ? 0.62 : 0.68; // Low: 0.62 (Unchanged), 0.68 (Changed)
      case 'H': return cvssData.scope === 'U' ? 0.27 : 0.5; // High: 0.27 (Unchanged), 0.5 (Changed)
      default: return 0.85;
    }
  };

  const getUserInteraction = () => {
    switch (cvssData.userInteraction) {
      case 'N': return 0.85;
      case 'R': return 0.62;
      default: return 0.85;
    }
  };

  const getConfidentialityImpact = () => {
    switch (cvssData.confidentiality) {
      case 'H': return 0.56;
      case 'L': return 0.22;
      case 'N': return 0;
      default: return 0.56;
    }
  };

  const getIntegrityImpact = () => {
    switch (cvssData.integrity) {
      case 'H': return 0.56;
      case 'L': return 0.22;
      case 'N': return 0;
      default: return 0.56;
    }
  };

  const getAvailabilityImpact = () => {
    switch (cvssData.availability) {
      case 'H': return 0.56;
      case 'L': return 0.22;
      case 'N': return 0;
      default: return 0.56;
    }
  };

  const getSeverity = (score: number) => {
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    if (score >= 0.1) return 'Low';
    return 'None';
  };

  const cvssResult = calculateCVSS();

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-medium">CVSS 3.1 Calculator</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Attack Vector</Label>
          <Select value={cvssData.attackVector} onValueChange={(value) => onUpdate({ ...cvssData, attackVector: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="N">Network (N)</SelectItem>
              <SelectItem value="A">Adjacent (A)</SelectItem>
              <SelectItem value="L">Local (L)</SelectItem>
              <SelectItem value="P">Physical (P)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Attack Complexity</Label>
          <Select value={cvssData.attackComplexity} onValueChange={(value) => onUpdate({ ...cvssData, attackComplexity: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Low (L)</SelectItem>
              <SelectItem value="H">High (H)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Privileges Required</Label>
          <Select value={cvssData.privilegesRequired} onValueChange={(value) => onUpdate({ ...cvssData, privilegesRequired: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="N">None (N)</SelectItem>
              <SelectItem value="L">Low (L)</SelectItem>
              <SelectItem value="H">High (H)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>User Interaction</Label>
          <Select value={cvssData.userInteraction} onValueChange={(value) => onUpdate({ ...cvssData, userInteraction: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="N">None (N)</SelectItem>
              <SelectItem value="R">Required (R)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Scope</Label>
          <Select value={cvssData.scope} onValueChange={(value) => onUpdate({ ...cvssData, scope: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="U">Unchanged (U)</SelectItem>
              <SelectItem value="C">Changed (C)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Confidentiality</Label>
          <Select value={cvssData.confidentiality} onValueChange={(value) => onUpdate({ ...cvssData, confidentiality: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="H">High (H)</SelectItem>
              <SelectItem value="L">Low (L)</SelectItem>
              <SelectItem value="N">None (N)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Integrity</Label>
          <Select value={cvssData.integrity} onValueChange={(value) => onUpdate({ ...cvssData, integrity: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="H">High (H)</SelectItem>
              <SelectItem value="L">Low (L)</SelectItem>
              <SelectItem value="N">None (N)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Availability</Label>
          <Select value={cvssData.availability} onValueChange={(value) => onUpdate({ ...cvssData, availability: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="H">High (H)</SelectItem>
              <SelectItem value="L">Low (L)</SelectItem>
              <SelectItem value="N">None (N)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white rounded border">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">CVSS Score:</span>
          <Badge className={`px-3 py-1 ${
            cvssResult.severity === 'Critical' ? 'bg-red-500 text-white' :
            cvssResult.severity === 'High' ? 'bg-orange-500 text-white' :
            cvssResult.severity === 'Medium' ? 'bg-yellow-500 text-white' :
            cvssResult.severity === 'Low' ? 'bg-green-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {cvssResult.score} ({cvssResult.severity})
          </Badge>
        </div>
        <div className="text-sm text-gray-600">
          <strong>Vector:</strong> {cvssResult.vector}
        </div>
      </div>
    </div>
  );
};



export const BugsList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const reportId = parseInt(id || '0');
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedBugId, setSelectedBugId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [issueDetailsHeight, setIssueDetailsHeight] = useState<number>(0);

  const { data, isLoading, error } = useBugs(reportId, {
    search: searchQuery || undefined,
    status: statusFilter || undefined,
    severity: severityFilter || undefined,
  });

  const bugs = data?.bugs || [];
  const deleteBugMutation = useDeleteBug();
  const [statusModal, setStatusModal] = useState<{ bugId: number; status: number; severity: number } | null>(null);

  // Sync selection with URL param on mount and when it changes
  useEffect(() => {
    const selectedParam = searchParams.get('selected');
    if (selectedParam) {
      const parsed = parseInt(selectedParam);
      setSelectedBugId(Number.isNaN(parsed) ? null : parsed);
    } else {
      setSelectedBugId(null);
    }
  }, [searchParams]);

  // Handle bug selection with refetch
  const handleBugSelection = async (bugId: number) => {
    setSelectedBugId(bugId);
    // Persist selection in URL
    const next = new URLSearchParams(searchParams);
    next.set('selected', String(bugId));
    setSearchParams(next, { replace: true });
    
    // Refetch bug details and comments to ensure fresh data
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['bug', bugId] }),
      queryClient.invalidateQueries({ queryKey: ['bug-comments', bugId] }),
      queryClient.invalidateQueries({ queryKey: ['bug-timeline', bugId] })
    ]);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading bugs</p>
          <Button asChild>
            <Link to={`/reports/${reportId}`}>Back to Report</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Inject custom styles for markdown editor */}
      <style dangerouslySetInnerHTML={{ __html: markdownEditorStyles }} />
      
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
            <h1 className="text-2xl font-bold tracking-tight">All Issues</h1>
            <p className="text-muted-foreground">List of all Issues</p>
          </div>
        </div>
        <Link to={`/reports/${reportId}/bugs/add${selectedBugId ? `?selected=${selectedBugId}` : ''}`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Bug
          </Button>
        </Link>
      </div>

      {/* Main Grid: left filters+list, middle details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Filters + Issue list */}
        <div className="lg:col-span-3 flex min-h-0">
          <Card className="flex flex-col" style={{ height: selectedBugId ? (issueDetailsHeight > 0 ? `${Math.max(issueDetailsHeight + 100, 400)}px` : '400px') : '750px' }}>
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-blue-500" />
                All Issues
              </CardTitle>
              <p className="text-sm text-gray-500">List of all Issues</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              {/* Filters */}
              <div className="space-y-3 mb-4 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search Bug Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Status...</option>
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Severity...</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Bug List */}
              <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))
                ) : bugs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Bug className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No bugs found</p>
                  </div>
                ) : (
                  bugs.map((bug) => (
                    <div key={bug.id} className="relative">
                      <BugListItem
                        bug={bug}
                        isSelected={selectedBugId === bug.id}
                        onClick={() => handleBugSelection(bug.id)}
                        onEdit={() => {
                          const qs = (selectedBugId ?? bug.id) ? `?selected=${selectedBugId ?? bug.id}` : '';
                          navigate(`/reports/${reportId}/bugs/${bug.id}/edit${qs}`);
                        }}
                        onStatus={() => setStatusModal({ bugId: bug.id, status: bug.status?.value ?? 0, severity: bug.severity?.value ?? 0 })}
                        onDelete={async () => {
                          if (!confirm('Delete this bug?')) return;
                          try {
                            await deleteBugMutation.mutateAsync(bug.id);
                          } catch (e) {}
                        }}
                      />
                      {/* Row action buttons moved into item footer */}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle: Issue Details */}
        <div className="lg:col-span-9 flex min-h-0 w-full">
          <Card className="flex flex-col w-full" style={{ height: selectedBugId ? 'auto' : '750px' }}>
            <BugDetails bugId={selectedBugId} onHeightChange={setIssueDetailsHeight} />
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
          <CommentsCard selectedBugId={selectedBugId} reportId={reportId} />
        </div>
      </div>
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

