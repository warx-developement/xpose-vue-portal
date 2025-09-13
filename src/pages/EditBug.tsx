import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { StatusChangeModal } from '../components/StatusChangeModal';

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
`;

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBug, useUpdateBug, useBugTypes, useAddBugAttachment, useDeleteBugAttachment } from '@/hooks/useBugs';
import { AttachmentUpload } from '@/components/ui/attachment-upload';
import { AttachmentDisplay, AttachmentGrid } from '@/components/ui/attachment-display';
import { useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const getSeverity = (score: number) => {
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    if (score >= 0.1) return 'Low';
    return 'None';
  };

  const calculateCVSS = () => {
    const getAttackVector = () => (cvssData.attackVector === 'N' ? 0.85 : cvssData.attackVector === 'A' ? 0.62 : cvssData.attackVector === 'L' ? 0.55 : 0.2);
    const getAttackComplexity = () => (cvssData.attackComplexity === 'L' ? 0.77 : 0.44);
    const getPrivilegesRequired = () => (cvssData.privilegesRequired === 'N' ? 0.85 : cvssData.privilegesRequired === 'L' ? (cvssData.scope === 'U' ? 0.62 : 0.68) : (cvssData.scope === 'U' ? 0.27 : 0.5));
    const getUserInteraction = () => (cvssData.userInteraction === 'N' ? 0.85 : 0.62);
    const getConfidentialityImpact = () => (cvssData.confidentiality === 'H' ? 0.56 : cvssData.confidentiality === 'L' ? 0.22 : 0);
    const getIntegrityImpact = () => (cvssData.integrity === 'H' ? 0.56 : cvssData.integrity === 'L' ? 0.22 : 0);
    const getAvailabilityImpact = () => (cvssData.availability === 'H' ? 0.56 : cvssData.availability === 'L' ? 0.22 : 0);

    const ISS = 1 - ((1 - getConfidentialityImpact()) * (1 - getIntegrityImpact()) * (1 - getAvailabilityImpact()));
    const impact = cvssData.scope === 'U' ? 6.42 * ISS : 7.52 * (ISS - 0.029) - 3.25 * Math.pow((ISS - 0.02), 15);
    const exploitability = 8.22 * getAttackVector() * getAttackComplexity() * getPrivilegesRequired() * getUserInteraction();
    let baseScore = impact <= 0 ? 0 : (cvssData.scope === 'U' ? Math.min(impact + exploitability, 10) : Math.min(1.08 * (impact + exploitability), 10));
    baseScore = Math.ceil(baseScore * 10) / 10;
    const severity = getSeverity(baseScore);
    const vector = `CVSS:3.1/AV:${cvssData.attackVector}/AC:${cvssData.attackComplexity}/PR:${cvssData.privilegesRequired}/UI:${cvssData.userInteraction}/S:${cvssData.scope}/C:${cvssData.confidentiality}/I:${cvssData.integrity}/A:${cvssData.availability}`;
    return { score: baseScore, severity, vector };
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

const EditBug = () => {
  const { reportId, bugId } = useParams<{ reportId: string; bugId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const { data: bug, isLoading } = useBug(parseInt(bugId!));
  const updateBugMutation = useUpdateBug();
  const { data: bugTypes } = useBugTypes();
  
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    domain: '',
    description: '',
    poc: '',
    fix: '',
    severity: '',
    type: '',
    status: '',
    use_cvss: false,
    cvss_vector: '',
    cvss_score: '',
    cvss_severity: ''
  });
  const [cvssData, setCvssData] = useState({
    attackVector: 'N',
    attackComplexity: 'L',
    privilegesRequired: 'N',
    userInteraction: 'N',
    scope: 'U',
    confidentiality: 'N',
    integrity: 'N',
    availability: 'N'
  });

  // Make all markdown links open in new tab
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
  }, [bug]);

  // Attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const addAttachmentMutation = useAddBugAttachment();
  const deleteAttachmentMutation = useDeleteBugAttachment();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleUploadAttachment = async () => {
    if (selectedFile && bug) {
      try {
        await addAttachmentMutation.mutateAsync({
          bugId: bug.id,
          file: selectedFile
        });
        setSelectedFile(null);
      } catch (error) {
        console.error('Error uploading attachment:', error);
      }
    }
  };

  // Clear selected file when upload is successful
  React.useEffect(() => {
    if (addAttachmentMutation.isSuccess) {
      setSelectedFile(null);
    }
  }, [addAttachmentMutation.isSuccess]);

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (bug) {
      try {
        await deleteAttachmentMutation.mutateAsync({
          bugId: bug.id,
          attachmentId
        });
      } catch (error) {
        console.error('Error deleting attachment:', error);
      }
    }
  };

  // Prefill form when bug data is loaded
  useEffect(() => {
    if (bug) {
      setFormData({
        title: bug.title || '',
        domain: bug.domain || '',
        description: bug.description || '',
        poc: bug.poc || '',
        fix: bug.fix || '',
        severity: bug.severity?.value?.toString() || '',
        type: bug.type?.id?.toString() || '',
        status: bug.status?.value?.toString() || '',
        use_cvss: true,
        cvss_vector: (bug as any).cvss?.vector || '',
        cvss_score: (bug as any).cvss?.score?.toString() || '',
        cvss_severity: (bug as any).cvss?.severity || ''
      });

      // If CVSS vector exists, parse into cvssData; else leave defaults
      const vector: string | undefined = (bug as any).cvss?.vector;
      if (vector && vector.startsWith('CVSS:3.1')) {
        const parts = vector.split('/').slice(1); // skip prefix
        const mapping: any = {};
        parts.forEach(p => {
          const [k, v] = p.split(':');
          mapping[k] = v;
        });
        setCvssData(prev => ({
          ...prev,
          attackVector: mapping['AV'] || prev.attackVector,
          attackComplexity: mapping['AC'] || prev.attackComplexity,
          privilegesRequired: mapping['PR'] || prev.privilegesRequired,
          userInteraction: mapping['UI'] || prev.userInteraction,
          scope: mapping['S'] || prev.scope,
          confidentiality: mapping['C'] || prev.confidentiality,
          integrity: mapping['I'] || prev.integrity,
          availability: mapping['A'] || prev.availability,
        }));
      }
    }
  }, [bug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim() || !formData.domain.trim() ||
        !formData.description.trim() || !formData.poc.trim() ||
        !formData.fix.trim() || !formData.type) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Ensure CVSS fields are populated based on current cvssData
      const computeCvss = () => {
        const getAttackVector = () => (cvssData.attackVector === 'N' ? 0.85 : cvssData.attackVector === 'A' ? 0.62 : cvssData.attackVector === 'L' ? 0.55 : 0.2);
        const getAttackComplexity = () => (cvssData.attackComplexity === 'L' ? 0.77 : 0.44);
        const getPrivilegesRequired = () => (cvssData.privilegesRequired === 'N' ? 0.85 : cvssData.privilegesRequired === 'L' ? (cvssData.scope === 'U' ? 0.62 : 0.68) : (cvssData.scope === 'U' ? 0.27 : 0.5));
        const getUserInteraction = () => (cvssData.userInteraction === 'N' ? 0.85 : 0.62);
        const getConfidentialityImpact = () => (cvssData.confidentiality === 'H' ? 0.56 : cvssData.confidentiality === 'L' ? 0.22 : 0);
        const getIntegrityImpact = () => (cvssData.integrity === 'H' ? 0.56 : cvssData.integrity === 'L' ? 0.22 : 0);
        const getAvailabilityImpact = () => (cvssData.availability === 'H' ? 0.56 : cvssData.availability === 'L' ? 0.22 : 0);
        const ISS = 1 - ((1 - getConfidentialityImpact()) * (1 - getIntegrityImpact()) * (1 - getAvailabilityImpact()));
        const impact = cvssData.scope === 'U' ? 6.42 * ISS : 7.52 * (ISS - 0.029) - 3.25 * Math.pow((ISS - 0.02), 15);
        const exploitability = 8.22 * getAttackVector() * getAttackComplexity() * getPrivilegesRequired() * getUserInteraction();
        let baseScore = impact <= 0 ? 0 : (cvssData.scope === 'U' ? Math.min(impact + exploitability, 10) : Math.min(1.08 * (impact + exploitability), 10));
        baseScore = Math.ceil(baseScore * 10) / 10;
        const severity = baseScore >= 9 ? 'Critical' : baseScore >= 7 ? 'High' : baseScore >= 4 ? 'Medium' : baseScore >= 0.1 ? 'Low' : 'None';
        const vector = `CVSS:3.1/AV:${cvssData.attackVector}/AC:${cvssData.attackComplexity}/PR:${cvssData.privilegesRequired}/UI:${cvssData.userInteraction}/S:${cvssData.scope}/C:${cvssData.confidentiality}/I:${cvssData.integrity}/A:${cvssData.availability}`;
        return { score: baseScore, severity, vector };
      };
      const cvss = computeCvss();

      await updateBugMutation.mutateAsync({
        bugId: parseInt(bugId!),
        data: {
          title: formData.title,
          domain: formData.domain,
          description: formData.description,
          poc: formData.poc,
          fix: formData.fix,
          type: formData.type ? parseInt(formData.type) : undefined,
          use_cvss: 1,
          cvss_vector: cvss.vector,
          cvss_score: cvss.score,
          cvss_severity: cvss.severity,
        }
      });

      // Navigate back to bugs list, preserving selected bug if present
      const selected = searchParams.get('selected') || bugId;
      navigate(`/reports/${reportId}/bugs${selected ? `?selected=${selected}` : ''}`);
    } catch (error) {
      console.error('Failed to update bug:', error);
      alert('Failed to update bug. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-32" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bug Not Found</h1>
          <p className="text-gray-600 mb-4">The bug you're looking for doesn't exist.</p>
          <Link to={`/reports/${reportId}/bugs`}>
            <Button>Back to Bugs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style dangerouslySetInnerHTML={{ __html: markdownEditorStyles }} />
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link to={`/reports/${reportId}/bugs${(searchParams.get('selected') || bugId) ? `?selected=${searchParams.get('selected') || bugId}` : ''}`}>
                <ArrowLeft className="h-4 w-4" />
                Back to Bugs
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Bug</h1>
              <p className="text-muted-foreground">Update bug information</p>
            </div>
          </div>
          <Badge className={`px-3 py-1 text-sm font-medium ${
            bug.severity?.label?.toLowerCase() === 'critical' ? 'bg-red-500 text-white' :
            bug.severity?.label?.toLowerCase() === 'high' ? 'bg-orange-500 text-white' :
            bug.severity?.label?.toLowerCase() === 'medium' ? 'bg-yellow-500 text-white' :
            bug.severity?.label?.toLowerCase() === 'low' ? 'bg-green-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {bug.severity?.label}
          </Badge>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Bug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Bug title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="domain">Domain *</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="example.com"
                    required
                  />
                </div>
              </div>

              {/* Second row: Type and Status/Severity button */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bugTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsStatusModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Change Status & Severity
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <div className="border rounded-lg overflow-hidden">
                  <MDEditor
                    value={formData.description}
                    onChange={(val) => setFormData(prev => ({ ...prev, description: val || '' }))}
                    height={300}
                    data-color-mode="light"
                    preview="edit"
                    hideToolbar={false}
                    style={{ backgroundColor: '#ffffff' }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="poc">Proof of Concept *</Label>
                <div className="border rounded-lg overflow-hidden">
                  <MDEditor
                    value={formData.poc}
                    onChange={(val) => setFormData(prev => ({ ...prev, poc: val || '' }))}
                    height={300}
                    data-color-mode="light"
                    preview="edit"
                    hideToolbar={false}
                    style={{ backgroundColor: '#ffffff' }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fix">Fix *</Label>
                <div className="border rounded-lg overflow-hidden">
                  <MDEditor
                    value={formData.fix}
                    onChange={(val) => setFormData(prev => ({ ...prev, fix: val || '' }))}
                    height={300}
                    data-color-mode="light"
                    preview="edit"
                    hideToolbar={false}
                    style={{ backgroundColor: '#ffffff' }}
                  />
                </div>
              </div>

              {/* Attachments */}
              <div>
                <Label htmlFor="attachment">Attachments</Label>
                
                {/* Existing Attachments */}
                {bug?.attachments && bug.attachments.length > 0 && (
                  <div className="mb-4">
                    <AttachmentGrid
                      attachments={bug.attachments}
                      onDelete={handleDeleteAttachment}
                      showActions={true}
                    />
                  </div>
                )}

                {/* Upload New Attachment */}
                <AttachmentUpload
                  onFileSelect={handleFileSelect}
                  onRemove={handleRemoveFile}
                  isUploading={addAttachmentMutation.isPending}
                  uploadProgress={uploadProgress}
                  maxSize={10}
                  className="mb-2"
                  selectedFile={selectedFile}
                />
                
                {selectedFile && (
                  <Button
                    type="button"
                    onClick={handleUploadAttachment}
                    disabled={addAttachmentMutation.isPending}
                    className="mb-2"
                  >
                    {addAttachmentMutation.isPending ? 'Uploading...' : 'Upload Attachment'}
                  </Button>
                )}
              </div>

              {/* CVSS mandatory - no toggle */}
              {
                <CVSSCalculator
                  cvssData={cvssData}
                  onUpdate={(data) => {
                    setCvssData(data);
                    const calculateCVSS = () => {
                      const getAttackVector = (d: any) => d.attackVector === 'N' ? 0.85 : d.attackVector === 'A' ? 0.62 : d.attackVector === 'L' ? 0.55 : 0.2;
                      const getAttackComplexity = (d: any) => d.attackComplexity === 'L' ? 0.77 : 0.44;
                      const getPrivilegesRequired = (d: any) => d.privilegesRequired === 'N' ? 0.85 : d.privilegesRequired === 'L' ? (d.scope === 'U' ? 0.62 : 0.68) : (d.scope === 'U' ? 0.27 : 0.5);
                      const getUserInteraction = (d: any) => d.userInteraction === 'N' ? 0.85 : 0.62;
                      const getConfidentialityImpact = (d: any) => d.confidentiality === 'H' ? 0.56 : d.confidentiality === 'L' ? 0.22 : 0;
                      const getIntegrityImpact = (d: any) => d.integrity === 'H' ? 0.56 : d.integrity === 'L' ? 0.22 : 0;
                      const getAvailabilityImpact = (d: any) => d.availability === 'H' ? 0.56 : d.availability === 'L' ? 0.22 : 0;
                      const ISS = 1 - ((1 - getConfidentialityImpact(data)) * (1 - getIntegrityImpact(data)) * (1 - getAvailabilityImpact(data)));
                      const impact = data.scope === 'U' ? 6.42 * ISS : 7.52 * (ISS - 0.029) - 3.25 * Math.pow((ISS - 0.02), 15);
                      const exploitability = 8.22 * getAttackVector(data) * getAttackComplexity(data) * getPrivilegesRequired(data) * getUserInteraction(data);
                      let baseScore = impact <= 0 ? 0 : (data.scope === 'U' ? Math.min(impact + exploitability, 10) : Math.min(1.08 * (impact + exploitability), 10));
                      baseScore = Math.ceil(baseScore * 10) / 10;
                      const severity = baseScore >= 9 ? 'Critical' : baseScore >= 7 ? 'High' : baseScore >= 4 ? 'Medium' : baseScore >= 0.1 ? 'Low' : 'None';
                      const vector = `CVSS:3.1/AV:${data.attackVector}/AC:${data.attackComplexity}/PR:${data.privilegesRequired}/UI:${data.userInteraction}/S:${data.scope}/C:${data.confidentiality}/I:${data.integrity}/A:${data.availability}`;
                      return { score: baseScore, severity, vector };
                    };
                    const result = calculateCVSS();
                    setFormData(prev => ({
                      ...prev,
                      cvss_score: result.score.toString(),
                      cvss_severity: result.severity,
                      cvss_vector: result.vector,
                    }));
                  }}
                />
              }

              {formData.use_cvss && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">CVSS Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">CVSS Score:</span> {formData.cvss_score}
                    </div>
                    <div>
                      <span className="font-medium">CVSS Severity:</span> {formData.cvss_severity}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">CVSS Vector:</span> {formData.cvss_vector}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" asChild>
                  <Link to={`/reports/${reportId}/bugs${(searchParams.get('selected') || bugId) ? `?selected=${searchParams.get('selected') || bugId}` : ''}`}>
                    Cancel
                  </Link>
                </Button>
                <Button type="submit" disabled={updateBugMutation.isPending}>
                  {updateBugMutation.isPending ? 'Updating...' : 'Update Bug'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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

export default EditBug;
