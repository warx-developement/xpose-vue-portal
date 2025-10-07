import { useCallback, useEffect, useRef } from 'react';
import { useAddBugAttachment } from './useBugs';
import { toast } from './use-toast';

interface UseClipboardImageEditProps {
  onImageUploaded?: (imageUrl: string, attachmentId: number) => void;
  bugId?: number;
  enabled?: boolean;
}

export const useClipboardImageEdit = ({ 
  onImageUploaded, 
  bugId, 
  enabled = true 
}: UseClipboardImageEditProps) => {
  const addBugAttachment = useAddBugAttachment();
  const editorRef = useRef<HTMLDivElement>(null);

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    if (!enabled || !bugId) return;

    const items = event.clipboardData?.items;
    if (!items) return;

    // Look for image data in clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault();
        
        const file = item.getAsFile();
        if (!file) continue;

        // Check if it's a valid image file
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file type',
            description: 'Only image files can be pasted from clipboard',
            variant: 'destructive',
          });
          return;
        }

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          toast({
            title: 'File too large',
            description: 'Image is larger than 10MB',
            variant: 'destructive',
          });
          return;
        }

        try {
          // Show uploading toast
          toast({
            title: 'Uploading image...',
            description: 'Please wait while your image is being uploaded',
          });

          // Upload the image directly to bug attachments
          const result = await addBugAttachment.mutateAsync({
            bugId,
            file,
          });

          // Generate markdown for the image
          const markdownImage = `![${result.filename}](${result.image_url})`;
          
          // Insert the markdown at cursor position
          insertMarkdownAtCursor(markdownImage);
          
          // Call the callback if provided
          onImageUploaded?.(result.image_url, result.id);

          toast({
            title: 'Image uploaded!',
            description: 'Image has been inserted into the editor and added to bug attachments',
          });

        } catch (error: any) {
          console.error('Error uploading clipboard image:', error);
          toast({
            title: 'Upload failed',
            description: error.response?.data?.message || 'Failed to upload image from clipboard',
            variant: 'destructive',
          });
        }
        
        break; // Only handle the first image found
      }
    }
  }, [enabled, bugId, addBugAttachment, onImageUploaded]);

  const insertMarkdownAtCursor = (markdown: string) => {
    // Try to find the active textarea or contenteditable element
    const activeElement = document.activeElement;
    
    if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.contentEditable === 'true')) {
      const textarea = activeElement as HTMLTextAreaElement | HTMLElement;
      const start = (textarea as HTMLTextAreaElement).selectionStart || 0;
      const end = (textarea as HTMLTextAreaElement).selectionEnd || 0;
      const currentValue = (textarea as HTMLTextAreaElement).value || textarea.textContent || '';
      
      const newValue = currentValue.slice(0, start) + markdown + currentValue.slice(end);
      
      if (textarea.tagName === 'TEXTAREA') {
        (textarea as HTMLTextAreaElement).value = newValue;
        (textarea as HTMLTextAreaElement).setSelectionRange(start + markdown.length, start + markdown.length);
      } else {
        textarea.textContent = newValue;
        // Set cursor position for contenteditable
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(textarea.firstChild || textarea, start + markdown.length);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      
      // Trigger input event to notify React of the change
      const inputEvent = new Event('input', { bubbles: true });
      textarea.dispatchEvent(inputEvent);
    } else {
      // Fallback: try to find MDEditor textarea
      const mdEditorTextarea = document.querySelector('.w-md-editor-text-input') as HTMLTextAreaElement;
      if (mdEditorTextarea) {
        const start = mdEditorTextarea.selectionStart || 0;
        const end = mdEditorTextarea.selectionEnd || 0;
        const currentValue = mdEditorTextarea.value || '';
        
        const newValue = currentValue.slice(0, start) + markdown + currentValue.slice(end);
        mdEditorTextarea.value = newValue;
        mdEditorTextarea.setSelectionRange(start + markdown.length, start + markdown.length);
        
        // Trigger input event
        const inputEvent = new Event('input', { bubbles: true });
        mdEditorTextarea.dispatchEvent(inputEvent);
      }
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Add paste event listener to the document
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste, enabled]);

  return {
    editorRef,
    isUploading: addBugAttachment.isPending,
  };
};
