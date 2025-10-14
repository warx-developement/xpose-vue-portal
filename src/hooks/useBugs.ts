import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bugsApi, draftAttachmentsApi, BugData, BugType, BugAttachment, CommentAttachment, DraftAttachment } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

// Get bugs for a report
export const useBugs = (reportId: number, params?: {
  page?: number;
  limit?: number;
  severity?: string;
  status?: string;
  search?: string;
}, options?: {
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ['bugs', reportId, params],
    queryFn: async () => {
      const response = await bugsApi.getBugs(reportId, params);
      return {
        bugs: response.data.data,
        pagination: response.data.pagination,
      };
    },
    enabled: !!reportId && (options?.enabled !== false),
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

// Get single bug details
export const useBug = (bugId: number) => {
  return useQuery({
    queryKey: ['bug', bugId],
    queryFn: async () => {
      const response = await bugsApi.getBug(bugId);
      return response.data.data;
    },
    enabled: !!bugId,
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

// Get bug types
export const useBugTypes = () => {
  return useQuery({
    queryKey: ['bug-types'],
    queryFn: async () => {
      const response = await bugsApi.getBugTypes();
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};


// Create new bug
export const useCreateBug = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, bugData }: { 
      reportId: number; 
      bugData: {
        title: string;
        domain: string;
        description: string;
        poc: string;
        fix: string;
        severity: number;
        type: number;
        use_cvss?: number;
        cvss_vector?: string;
        cvss_score?: number;
        cvss_severity?: string;
        attachment_ids?: number[];
      }
    }) => {
      const response = await bugsApi.createBug(reportId, bugData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bugs', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
      toast({
        title: 'Success',
        description: 'Bug created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create bug',
        variant: 'destructive',
      });
    },
  });
};

// Update bug details
export const useUpdateBug = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bugId, data }: { 
      bugId: number; 
      data: {
        title?: string;
        domain?: string;
        description?: string;
        poc?: string;
        fix?: string;
        type?: number;
        use_cvss?: number;
        cvss_vector?: string;
        cvss_score?: number;
        cvss_severity?: string;
      }
    }) => {
      const response = await bugsApi.updateBug(bugId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bug', variables.bugId] });
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      toast({
        title: 'Success',
        description: 'Bug updated successfully',
      });
    },
    onError: (error: any) => {
      console.error('Failed to update bug:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update bug',
        variant: 'destructive',
      });
    },
  });
};

// Update bug status
export const useUpdateBugStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bugId, severity, status }: { bugId: number; severity?: number; status?: number }) => {
      const response = await bugsApi.updateBugStatus(bugId, { severity, status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bug', variables.bugId] });
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      queryClient.invalidateQueries({ queryKey: ['bug-timeline', variables.bugId] });
      toast({
        title: 'Success',
        description: 'Bug status updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update bug status',
        variant: 'destructive',
      });
    },
  });
};

// Add bug attachment
export const useAddBugAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bugId, file }: { bugId: number; file: File }): Promise<BugAttachment> => {
      const response = await bugsApi.addBugAttachment(bugId, file);
      return response.data.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bug', variables.bugId] });
      toast({
        title: 'Success',
        description: 'Attachment uploaded successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload attachment',
        variant: 'destructive',
      });
    },
  });
};

// Delete bug attachment
export const useDeleteBugAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bugId, attachmentId }: { bugId: number; attachmentId: number }) => {
      const response = await bugsApi.deleteBugAttachment(bugId, attachmentId);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bug', variables.bugId] });
      toast({
        title: 'Success',
        description: 'Attachment deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete attachment',
        variant: 'destructive',
      });
    },
  });
};

// Comments hooks
export const useBugComments = (bugId: number) => {
  return useQuery({
    queryKey: ['bug-comments', bugId],
    queryFn: () => bugsApi.getBugComments(bugId),
    select: (response) => response.data.data,
    enabled: !!bugId,
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

// Bug timeline
export const useBugTimeline = (bugId: number) => {
  return useQuery({
    queryKey: ['bug-timeline', bugId],
    queryFn: async () => {
      const response = await bugsApi.getBugTimeline(bugId);
      return response.data.data;
    },
    enabled: !!bugId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bugId, comment, attachment_ids }: { bugId: number; comment: string; attachment_ids?: number[] }) =>
      bugsApi.createComment(bugId, comment, attachment_ids),
    onSuccess: (_, { bugId }) => {
      queryClient.invalidateQueries({ queryKey: ['bug-comments', bugId] });
      queryClient.invalidateQueries({ queryKey: ['bug', bugId] });
      queryClient.invalidateQueries({ queryKey: ['bug-timeline', bugId] });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, comment }: { commentId: number; comment: string }) =>
      bugsApi.updateComment(commentId, comment),
    onSuccess: (_, { commentId }) => {
      // Invalidate all bug comments queries since we don't know which bug this comment belongs to
      queryClient.invalidateQueries({ queryKey: ['bug-comments'] });
      // We also don't have bugId here; invalidate all timelines
      queryClient.invalidateQueries({ queryKey: ['bug-timeline'] });
    },
  });
};

export const useAddCommentAttachment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, file }: { commentId: number; file: File }): Promise<CommentAttachment> => {
      const response = await bugsApi.addCommentAttachment(commentId, file);
      return response.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug-comments'] });
      queryClient.invalidateQueries({ queryKey: ['bug-timeline'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload attachment',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCommentAttachment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, attachmentId }: { commentId: number; attachmentId: number }) =>
      bugsApi.deleteCommentAttachment(commentId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug-comments'] });
      queryClient.invalidateQueries({ queryKey: ['bug-timeline'] });
      toast({
        title: 'Success',
        description: 'Attachment deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete attachment',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (commentId: number) =>
      bugsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug-comments'] });
      queryClient.invalidateQueries({ queryKey: ['bug-timeline'] });
    },
  });
};

// Delete bug
export const useDeleteBug = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bugId: number) => bugsApi.deleteBug(bugId),
    onSuccess: (_, bugId) => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      queryClient.invalidateQueries({ queryKey: ['bug', bugId] });
      toast({ title: 'Deleted', description: 'Bug deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to delete bug', variant: 'destructive' });
    },
  });
};

// Draft Attachment Hooks
export const useUploadDraftAttachment = () => {
  return useMutation({
    mutationFn: async ({ reportId, file }: { reportId: number; file: File }): Promise<DraftAttachment> => {
      const response = await draftAttachmentsApi.uploadDraftAttachment(reportId, file);
      return response.data.data!;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Draft attachment uploaded successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to upload draft attachment', variant: 'destructive' });
    },
  });
};

export const useUploadCommentDraftAttachment = () => {
  return useMutation({
    mutationFn: async ({ reportId, file }: { reportId: number; file: File }): Promise<DraftAttachment> => {
      const response = await draftAttachmentsApi.uploadCommentDraftAttachment(reportId, file);
      return response.data.data!;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Draft attachment uploaded successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to upload draft attachment', variant: 'destructive' });
    },
  });
};

export const useCleanupDraftAttachments = () => {
  return useMutation({
    mutationFn: async (): Promise<{ success: boolean; message: string }> => {
      const response = await draftAttachmentsApi.cleanupDraftAttachments();
      return response.data;
    },
    onSuccess: (data) => {
      toast({ title: 'Success', description: data.message });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to cleanup draft attachments', variant: 'destructive' });
    },
  });
};
