import { BugAttachment, CommentAttachment, DraftAttachment } from './api';

// Utility function to normalize attachment data from different API versions
export const normalizeAttachment = (attachment: any): BugAttachment | CommentAttachment | DraftAttachment => {
  // If it's already normalized, return as is
  if (attachment.filename !== undefined) {
    return attachment;
  }

  // Handle legacy API format that only has id and image_url
  return {
    id: attachment.id,
    image_url: attachment.image_url,
    filename: extractFilenameFromUrl(attachment.image_url),
    size: 0, // Unknown size for legacy attachments
    type: 'unknown',
    created_at: new Date().toISOString(), // Use current time as fallback
  };
};

// Extract filename from URL
const extractFilenameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || 'attachment';
    
    // If no extension, try to determine from URL parameters or default
    if (!filename.includes('.')) {
      return 'attachment';
    }
    
    return filename;
  } catch (error) {
    return 'attachment';
  }
};

// Utility function to check if attachment has required fields
export const isValidAttachment = (attachment: any): boolean => {
  return attachment && 
         (typeof attachment.id === 'number' || typeof attachment.id === 'string') && 
         typeof attachment.image_url === 'string' &&
         attachment.image_url.length > 0;
};

// Utility function to get file type from filename or URL
export const getFileTypeFromAttachment = (attachment: BugAttachment | CommentAttachment | DraftAttachment): string => {
  if (attachment.type && attachment.type !== 'unknown') {
    return attachment.type;
  }
  
  const filename = attachment.filename || extractFilenameFromUrl(attachment.image_url);
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (!extension) return 'unknown';
  
  const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  const documentTypes = ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
  
  if (imageTypes.includes(extension)) return 'image';
  if (videoTypes.includes(extension)) return 'video';
  if (documentTypes.includes(extension)) return 'document';
  if (archiveTypes.includes(extension)) return 'archive';
  
  return 'unknown';
};
