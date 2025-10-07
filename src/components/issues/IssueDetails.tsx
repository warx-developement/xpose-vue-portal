import React, { useEffect, useRef } from 'react';
import { FileText, Paperclip } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MDEditor from '@uiw/react-md-editor';
import { useBug } from '@/hooks/useBugs';
import { AttachmentDisplay } from '@/components/ui/attachment-display';

export const IssueDetails = ({ bugId, onHeightChange }: { bugId: number | null; onHeightChange?: (height: number) => void }) => {
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

  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
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
              <Badge variant={getSeverityVariant(bug.severity.label)} className="px-2">{bug.severity.label}</Badge>
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
              <div className="[&_.w-md-editor]:bg-white [&_.w-md-editor-text]:bg-white [&_.w-md-editor-text]:text-black [&_.w-md-editor-text]:border-gray-200 [&_.w-md-editor-text]:rounded [&_.w-md-editor-text]:p-2 [&_.w-md-editor-text]:shadow-none [&_pre]:bg-gray-100 [&_pre]:text-gray-800 [&_pre]:border [&_pre]:border-gray-200 [&_pre]:rounded [&_pre]:p-2 [&_code]:bg-gray-100 [&_code]:text-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_blockquote]:bg-gray-50 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:text-gray-700">
                <MDEditor.Markdown source={bug.description} data-color-mode="light" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="poc" className="mt-4">
            <div className="text-sm text-gray-700 max-w-none bg-white p-3 rounded border">
              <div className="[&_.w-md-editor]:bg-white [&_.w-md-editor-text]:bg-white [&_.w-md-editor-text]:text-black [&_.w-md-editor-text]:border-gray-200 [&_.w-md-editor-text]:rounded [&_.w-md-editor-text]:p-2 [&_.w-md-editor-text]:shadow-none [&_pre]:bg-gray-100 [&_pre]:text-gray-800 [&_pre]:border [&_pre]:border-gray-200 [&_pre]:rounded [&_pre]:p-2 [&_code]:bg-gray-100 [&_code]:text-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_blockquote]:bg-gray-50 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:text-gray-700">
                <MDEditor.Markdown source={bug.poc} data-color-mode="light" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="fix" className="mt-4">
            <div className="text-sm text-gray-700 max-w-none bg-white p-3 rounded border">
              <div className="[&_.w-md-editor]:bg-white [&_.w-md-editor-text]:bg-white [&_.w-md-editor-text]:text-black [&_.w-md-editor-text]:border-gray-200 [&_.w-md-editor-text]:rounded [&_.w-md-editor-text]:p-2 [&_.w-md-editor-text]:shadow-none [&_pre]:bg-gray-100 [&_pre]:text-gray-800 [&_pre]:border [&_pre]:border-gray-200 [&_pre]:rounded [&_pre]:p-2 [&_code]:bg-gray-100 [&_code]:text-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_blockquote]:bg-gray-50 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:text-gray-700">
                <MDEditor.Markdown source={bug.fix} data-color-mode="light" />
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
