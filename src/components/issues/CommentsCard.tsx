import React, { useEffect, useState } from 'react';
import { MessageSquare, Edit, Trash2, Paperclip, Save, X, Upload, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import MDEditor from '@uiw/react-md-editor';
import { useBugComments, useCreateComment, useUpdateComment, useDeleteComment, useAddCommentAttachment, useDeleteCommentAttachment, useUploadCommentDraftAttachment } from '@/hooks/useBugs';
import { useClipboardImage } from '@/hooks/useClipboardImage';
import { DraftAttachment } from '@/lib/api';
import { AttachmentUpload } from '@/components/ui/attachment-upload';
import { AttachmentDisplay, AttachmentGrid } from '@/components/ui/attachment-display';
import { useToast } from '@/hooks/use-toast';
import { normalizeAttachment } from '@/lib/attachment-utils';

export const CommentsCard = ({ selectedBugId, reportId }: { selectedBugId: number | null; reportId: number }) => {
  const { data: comments, isLoading: commentsLoading } = useBugComments(selectedBugId || 0);
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const addCommentAttachmentMutation = useAddCommentAttachment();
  const deleteCommentAttachmentMutation = useDeleteCommentAttachment();
  const uploadCommentDraftAttachmentMutation = useUploadCommentDraftAttachment();
  const { toast } = useToast();

  // Enable clipboard image paste functionality for comments
  useClipboardImage({
    reportId: reportId,
    enabled: true,
    onImageUploaded: (imageUrl, attachmentId) => {
      // Add the uploaded attachment to the draft attachments for comments
      setDraftAttachments(prev => [...prev, {
        id: attachmentId,
        image_url: imageUrl,
        filename: `clipboard-image-${Date.now()}.png`,
        size: 0,
        type: 'image',
        created_at: new Date().toISOString(),
        is_draft: true
      }]);
    }
  });
  
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
          <div className="inline-flex items-center justify-center w-10 h-10 bg-green-50 rounded-xl">
            <MessageSquare className="h-5 w-5 text-green-600" />
          </div>
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
                      {/* Mobile: Line by line layout */}
                      <div className="block lg:hidden space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                            {comment.user_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-sm">{comment.user_name}</span>
                        </div>
                        <div className="text-xs text-gray-500 ml-8">
                          {formatDate(comment.created_at)}
                        </div>
                        <div className="flex items-center gap-1 ml-8 p-2">
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
                      
                      {/* Desktop: Single line layout */}
                      <div className="hidden lg:flex items-center justify-between mb-2">
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
                            <div className="[&_.w-md-editor]:bg-white [&_.w-md-editor-text]:bg-white [&_.w-md-editor-text]:text-black [&_.w-md-editor-text]:border-gray-200 [&_.w-md-editor-text]:rounded [&_.w-md-editor-text]:p-2 [&_.w-md-editor-text]:shadow-none [&_pre]:bg-gray-100 [&_pre]:text-gray-800 [&_pre]:border [&_pre]:border-gray-200 [&_pre]:rounded [&_pre]:p-2 [&_code]:bg-gray-100 [&_code]:text-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_blockquote]:bg-gray-50 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:text-gray-700">
                              <MDEditor.Markdown source={comment.comment} data-color-mode="light" />
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