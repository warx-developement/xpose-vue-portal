import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Trash2, File, Image, Video, Archive, FileText, Copy } from 'lucide-react';
import { BugAttachment, CommentAttachment, DraftAttachment } from '@/lib/api';
import { normalizeAttachment, isValidAttachment } from '@/lib/attachment-utils';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface AttachmentDisplayProps {
  attachment: BugAttachment | CommentAttachment | DraftAttachment;
  onDelete?: () => void;
  onView?: () => void;
  showActions?: boolean;
  className?: string;
}

const ALLOWED_IMAGE_TYPES = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
const ALLOWED_DOCUMENT_TYPES = ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
const ALLOWED_VIDEO_TYPES = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
const ALLOWED_ARCHIVE_TYPES = ['zip', 'rar', '7z', 'tar', 'gz'];

const getFileIcon = (filename: string | undefined) => {
  if (!filename) return <File className="h-4 w-4 text-gray-500" />;
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (ALLOWED_IMAGE_TYPES.includes(extension || '')) {
    return <Image className="h-4 w-4 text-blue-500" />;
  }
  if (ALLOWED_VIDEO_TYPES.includes(extension || '')) {
    return <Video className="h-4 w-4 text-purple-500" />;
  }
  if (ALLOWED_ARCHIVE_TYPES.includes(extension || '')) {
    return <Archive className="h-4 w-4 text-orange-500" />;
  }
  if (ALLOWED_DOCUMENT_TYPES.includes(extension || '')) {
    return <FileText className="h-4 w-4 text-green-500" />;
  }
  
  return <File className="h-4 w-4 text-gray-500" />;
};

const getFileTypeBadge = (filename: string | undefined) => {
  if (!filename) return <Badge variant="outline" className="text-xs">File</Badge>;
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (ALLOWED_IMAGE_TYPES.includes(extension || '')) {
    return <Badge variant="secondary" className="text-xs">Image</Badge>;
  }
  if (ALLOWED_VIDEO_TYPES.includes(extension || '')) {
    return <Badge variant="secondary" className="text-xs">Video</Badge>;
  }
  if (ALLOWED_ARCHIVE_TYPES.includes(extension || '')) {
    return <Badge variant="secondary" className="text-xs">Archive</Badge>;
  }
  if (ALLOWED_DOCUMENT_TYPES.includes(extension || '')) {
    return <Badge variant="secondary" className="text-xs">Document</Badge>;
  }
  
  return <Badge variant="outline" className="text-xs">File</Badge>;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown date';
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

export const AttachmentDisplay: React.FC<AttachmentDisplayProps> = ({
  attachment,
  onDelete,
  onView,
  showActions = true,
  className
}) => {
  // Add error handling for missing attachment data
  if (!isValidAttachment(attachment)) {
    console.error('Invalid attachment data:', attachment);
    return (
      <Card className={cn('border border-gray-200', className)}>
        <CardContent className="p-3">
          <div className="flex items-center justify-center text-gray-500">
            <File className="h-4 w-4 mr-2" />
            <span className="text-sm">Invalid attachment data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Normalize attachment data to handle different API versions
  const normalizedAttachment = normalizeAttachment(attachment);
  const isImage = ALLOWED_IMAGE_TYPES.includes(normalizedAttachment.filename?.split('.').pop()?.toLowerCase() || '');

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const link = document.createElement('a');
    link.href = normalizedAttachment.image_url;
    link.download = normalizedAttachment.filename || 'attachment';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyMarkdown = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const filename = normalizedAttachment.filename || 'attachment';
    let markdownLink: string;
    
    // Generate appropriate markdown based on file type
    if (isImage) {
      // For images, use markdown image syntax
      markdownLink = `![${filename}](${normalizedAttachment.image_url})`;
    } else {
      // For other files, use markdown link syntax
      markdownLink = `[${filename}](${normalizedAttachment.image_url})`;
    }
    
    try {
      await navigator.clipboard.writeText(markdownLink);
      toast({
        title: 'Markdown copied!',
        description: isImage ? 'Image markdown copied to clipboard' : 'File link markdown copied to clipboard',
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      try {
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
      } catch (fallbackError) {
        toast({
          title: 'Copy failed',
          description: 'Failed to copy markdown link. Please copy manually.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isImage) {
      // Open image in new tab
      window.open(normalizedAttachment.image_url, '_blank');
    } else {
      // For non-image files, try to open in new tab
      // This will work for PDFs and other files that browsers can display
      window.open(normalizedAttachment.image_url, '_blank');
    }
  };

  return (
    <Card className={cn('border border-gray-200 hover:border-gray-300 transition-colors', className)}>
      <CardContent className="p-3">
        {/* Mobile: Stacked layout */}
        <div className="block sm:hidden space-y-3">
          {/* File type badge at top */}
          <div className="flex justify-center">
            {getFileTypeBadge(normalizedAttachment.filename)}
          </div>
          
          {/* File info */}
          <div className="flex items-center space-x-3">
            {getFileIcon(normalizedAttachment.filename)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {normalizedAttachment.filename || 'Unknown file'}
              </p>
              <div className="text-xs text-gray-500 mt-1">
                <span>{formatDate(normalizedAttachment.created_at)}</span>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          {showActions && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyMarkdown}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                title="Copy markdown link"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0"
                title="Download file"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleView}
                className="h-8 w-8 p-0"
                title={isImage ? "View image" : "View file"}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  title="Delete attachment"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Desktop: Original horizontal layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getFileIcon(normalizedAttachment.filename)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {normalizedAttachment.filename || 'Unknown file'}
                </p>
                {getFileTypeBadge(normalizedAttachment.filename)}
              </div>
              <div className="text-xs text-gray-500">
                <span>{formatDate(normalizedAttachment.created_at)}</span>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-1 ml-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyMarkdown}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                title="Copy markdown link"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0"
                title="Download file"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleView}
                className="h-8 w-8 p-0"
                title={isImage ? "View image" : "View file"}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  title="Delete attachment"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Component for displaying multiple attachments in a grid
interface AttachmentGridProps {
  attachments: (BugAttachment | CommentAttachment)[];
  onDelete?: (attachmentId: number) => void;
  showActions?: boolean;
  className?: string;
}

export const AttachmentGrid: React.FC<AttachmentGridProps> = ({
  attachments,
  onDelete,
  showActions = true,
  className
}) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {attachments.map((attachment) => {
        // Skip invalid attachments
        if (!isValidAttachment(attachment)) {
          return null;
        }
        
        return (
          <AttachmentDisplay
            key={attachment.id}
            attachment={attachment}
            onDelete={onDelete ? () => onDelete(attachment.id) : undefined}
            showActions={showActions}
          />
        );
      })}
    </div>
  );
};
