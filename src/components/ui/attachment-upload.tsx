import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, X, File, Image, Video, Archive, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AttachmentUploadProps {
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
  selectedFile?: File | null; // Make it controlled
}

const ALLOWED_IMAGE_TYPES = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
const ALLOWED_DOCUMENT_TYPES = ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
const ALLOWED_VIDEO_TYPES = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
const ALLOWED_ARCHIVE_TYPES = ['zip', 'rar', '7z', 'tar', 'gz'];

const BLOCKED_TYPES = ['html', 'htm', 'svg', 'php', 'js', 'exe', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'jar', 'war', 'ear'];

const getFileIcon = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (ALLOWED_IMAGE_TYPES.includes(extension || '')) {
    return <Image className="h-4 w-4" />;
  }
  if (ALLOWED_VIDEO_TYPES.includes(extension || '')) {
    return <Video className="h-4 w-4" />;
  }
  if (ALLOWED_ARCHIVE_TYPES.includes(extension || '')) {
    return <Archive className="h-4 w-4" />;
  }
  if (ALLOWED_DOCUMENT_TYPES.includes(extension || '')) {
    return <FileText className="h-4 w-4" />;
  }
  
  return <File className="h-4 w-4" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  onFileSelect,
  onRemove,
  isUploading = false,
  uploadProgress = 0,
  maxSize = 10, // 10 MB default
  acceptedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_ARCHIVE_TYPES],
  disabled = false,
  className,
  selectedFile: controlledSelectedFile = null
}) => {
  const [internalSelectedFile, setInternalSelectedFile] = useState<File | null>(null);
  
  // Use controlled prop if provided, otherwise use internal state
  const selectedFile = controlledSelectedFile !== undefined ? controlledSelectedFile : internalSelectedFile;

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          toast({
            title: 'File too large',
            description: `File "${file.name}" is larger than ${maxSize}MB`,
            variant: 'destructive',
          });
        } else if (error.code === 'file-invalid-type') {
          toast({
            title: 'Invalid file type',
            description: `File "${file.name}" is not an allowed file type`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Upload error',
            description: error.message,
            variant: 'destructive',
          });
        }
      });
    });

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Check if file type is blocked
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension && BLOCKED_TYPES.includes(extension)) {
        toast({
          title: 'File type blocked',
          description: `File type "${extension}" is not allowed for security reasons`,
          variant: 'destructive',
        });
        return;
      }
      
      if (controlledSelectedFile === undefined) {
        setInternalSelectedFile(file);
      }
      onFileSelect(file);
    }
  }, [maxSize, onFileSelect, controlledSelectedFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[`.${type}`] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: false,
    disabled: disabled || isUploading,
  });

  const handleRemove = () => {
    if (controlledSelectedFile === undefined) {
      setInternalSelectedFile(null);
    }
    onRemove?.();
  };

  return (
    <div className={cn('w-full', className)}>
      {!selectedFile ? (
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={cn(
                'flex flex-col items-center justify-center space-y-4 cursor-pointer',
                isDragActive && 'bg-gray-50',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {isDragActive ? 'Drop the file here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max size: {maxSize}MB • Allowed types: {acceptedTypes.slice(0, 5).join(', ')}
                    {acceptedTypes.length > 5 && ` +${acceptedTypes.length - 5} more`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon(selectedFile.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isUploading && (
              <div className="mt-3">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
