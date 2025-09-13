import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
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
`;

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreateBug, useBugTypes, useAddBugAttachment, useUploadDraftAttachment } from '@/hooks/useBugs';
import { DraftAttachment } from '@/lib/api';
import { AttachmentUpload } from '@/components/ui/attachment-upload';
import { AttachmentDisplay } from '@/components/ui/attachment-display';
import { saveDraftBug, loadDraftBug, clearDraftBug, autoSaveDraft, hasValidDraft, getDraftAge } from '@/lib/draft-storage';
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

const AddBug = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    domain: '',
    description: '',
    poc: '',
    fix: '',
    type: '',
    use_cvss: true,
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

  // Attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draftAttachments, setDraftAttachments] = useState<DraftAttachment[]>([]);
  
  // Draft state
  const [hasDraftData, setHasDraftData] = useState(false);
  const [draftAge, setDraftAge] = useState<number | null>(null);

  const createBugMutation = useCreateBug();
  const addAttachmentMutation = useAddBugAttachment();
  const uploadDraftAttachmentMutation = useUploadDraftAttachment();
  const { data: bugTypes } = useBugTypes();

  // Load draft data on component mount
  useEffect(() => {
    if (reportId) {
      const draftData = loadDraftBug(parseInt(reportId));
      if (draftData) {
        setFormData({
          title: draftData.title,
          domain: draftData.domain,
          description: draftData.description,
          poc: draftData.poc,
          fix: draftData.fix,
          type: draftData.type,
          use_cvss: draftData.use_cvss,
          cvss_vector: draftData.cvss_vector,
          cvss_score: draftData.cvss_score,
          cvss_severity: draftData.cvss_severity
        });
        
        setCvssData({
          attackVector: draftData.attackVector,
          attackComplexity: draftData.attackComplexity,
          privilegesRequired: draftData.privilegesRequired,
          userInteraction: draftData.userInteraction,
          scope: draftData.scope,
          confidentiality: draftData.confidentiality,
          integrity: draftData.integrity,
          availability: draftData.availability
        });
        
        setDraftAttachments(draftData.draftAttachments);
        setHasDraftData(true);
        setDraftAge(getDraftAge(parseInt(reportId)));
        
        console.log('Draft data restored from localStorage');
      }
    }
  }, [reportId]);

  // Initialize CVSS fields based on default cvssData
  useEffect(() => {
    const getAttackVector = () => (cvssData.attackVector === 'N' ? 0.85 : cvssData.attackVector === 'A' ? 0.62 : cvssData.attackVector === 'L' ? 0.55 : 0.2);
    const getAttackComplexity = () => (cvssData.attackComplexity === 'L' ? 0.77 : 0.44);
    const getPrivilegesRequired = () => (cvssData.privilegesRequired === 'N' ? 0.85 : cvssData.privilegesRequired === 'L' ? (cvssData.scope === 'U' ? 0.62 : 0.68) : (cvssData.scope === 'U' ? 0.27 : 0.5));
    const getUserInteraction = () => (cvssData.userInteraction === 'N' ? 0.85 : 0.62);
    const getConfidentialityImpact = () => (cvssData.confidentiality === 'H' ? 0.56 : cvssData.confidentiality === 'L' ? 0.22 : 0);
    const getIntegrityImpact = () => (cvssData.integrity === 'H' ? 0.56 : cvssData.integrity === 'L' ? 0.22 : 0);
    const getAvailabilityImpact = () => (cvssData.availability === 'H' ? 0.56 : cvssData.availability === 'L' ? 0.22 : 0);
    const ISS = 1 - ((1 - getConfidentialityImpact()) * (1 - getIntegrityImpact()) * (1 - getAvailabilityImpact()));
    const impact = cvssData.scope === 'U' ? 6.42 * ISS : 7.52 * (ISS - 0.029) - 3.25 * Math.pow((ISS - 0.02), 15);
    let baseScore = impact <= 0 ? 0 : (cvssData.scope === 'U' ? Math.min(impact + 8.22 * getAttackVector() * getAttackComplexity() * getPrivilegesRequired() * getUserInteraction(), 10) : Math.min(1.08 * (impact + 8.22 * getAttackVector() * getAttackComplexity() * getPrivilegesRequired() * getUserInteraction()), 10));
    baseScore = Math.ceil(baseScore * 10) / 10;
    const severity = baseScore >= 9 ? 'Critical' : baseScore >= 7 ? 'High' : baseScore >= 4 ? 'Medium' : baseScore >= 0.1 ? 'Low' : 'None';
    const vector = `CVSS:3.1/AV:${cvssData.attackVector}/AC:${cvssData.attackComplexity}/PR:${cvssData.privilegesRequired}/UI:${cvssData.userInteraction}/S:${cvssData.scope}/C:${cvssData.confidentiality}/I:${cvssData.integrity}/A:${cvssData.availability}`;
    setFormData(prev => ({
      ...prev,
      cvss_score: baseScore.toString(),
      cvss_severity: severity,
      cvss_vector: vector,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft data when form changes
  useEffect(() => {
    if (reportId && (formData.title || formData.domain || formData.description || formData.poc || formData.fix)) {
      autoSaveDraft(parseInt(reportId), { ...formData, ...cvssData }, draftAttachments);
    }
  }, [formData, cvssData, draftAttachments, reportId]);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    
    // Upload as draft attachment immediately
    try {
      const draftAttachment = await uploadDraftAttachmentMutation.mutateAsync({
        reportId: parseInt(reportId!),
        file: file
      });
      setDraftAttachments(prev => [...prev, draftAttachment]);
      setSelectedFile(null); // Clear selected file since it's now uploaded as draft
    } catch (error) {
      console.error('Error uploading draft attachment:', error);
      setSelectedFile(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    // Remove the last uploaded draft attachment if it exists
    if (draftAttachments.length > 0) {
      setDraftAttachments(prev => prev.slice(0, -1));
    }
  };

  const handleRemoveDraftAttachment = (attachmentId: string | number) => {
    setDraftAttachments(prev => prev.filter(att => att.id != attachmentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim() || !formData.domain.trim() ||
        !formData.description.trim() || !formData.poc.trim() ||
        !formData.fix.trim() || !formData.type || !formData.cvss_score) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Use existing draft attachments
      const attachmentIds = draftAttachments.map(att => parseInt(att.id.toString()));

      const result = await createBugMutation.mutateAsync({
        reportId: parseInt(reportId!),
        bugData: {
          title: formData.title,
          domain: formData.domain,
          description: formData.description,
          poc: formData.poc,
          fix: formData.fix,
          // severity derived from CVSS severity mapping
          severity: (() => {
            const map: { [k: string]: string } = { Critical: '1', High: '2', Medium: '3', Low: '4', None: '5' };
            return parseInt(map[formData.cvss_severity] || '5');
          })(),
          type: parseInt(formData.type),
          use_cvss: 1,
          cvss_vector: formData.cvss_vector,
          cvss_score: formData.cvss_score ? parseFloat(formData.cvss_score) : undefined,
          cvss_severity: formData.cvss_severity,
          attachment_ids: attachmentIds.length > 0 ? attachmentIds : undefined
        }
      });

      // Clear draft data after successful creation
      clearDraftBug(parseInt(reportId!));
      setHasDraftData(false);
      setDraftAge(null);

      // Navigate back to bugs list, preserving previously selected bug if present
      const selected = searchParams.get('selected');
      navigate(`/reports/${reportId}/bugs${selected ? `?selected=${selected}` : ''}`);
    } catch (error) {
      console.error('Failed to create bug:', error);
      alert('Failed to create bug. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style dangerouslySetInnerHTML={{ __html: markdownEditorStyles }} />
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link to={`/reports/${reportId}/bugs${searchParams.get('selected') ? `?selected=${searchParams.get('selected')}` : ''}`}>
                <ArrowLeft className="h-4 w-4" />
                Back to Bugs
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Add New Bug</h1>
              <p className="text-muted-foreground">Create a new bug report</p>
              {hasDraftData && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-600 font-medium">
                    Draft saved {draftAge !== null ? `${draftAge} minutes ago` : 'recently'} • Auto-saves every 2 seconds
                  </span>
                </div>
              )}
            </div>
          </div>
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

              {/* Second row: Type */}
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
                <Label htmlFor="attachment">Attachments (Optional)</Label>
                <AttachmentUpload
                  onFileSelect={handleFileSelect}
                  onRemove={handleRemoveFile}
                  isUploading={uploadDraftAttachmentMutation.isPending}
                  uploadProgress={uploadProgress}
                  maxSize={10}
                  className="mt-2"
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

              {/* CVSS is mandatory - no toggle */}

              {
                <CVSSCalculator 
                  cvssData={cvssData} 
                  onUpdate={(data) => {
                    setCvssData(data);
                    // Calculate CVSS score and update form data - Correct Formula
                    const calculateCVSS = () => {
                      // Step 1: Impact Sub-Score Calculation
                      // 1.1 Impact Subscore (ISS)
                      const confidentiality = getConfidentialityImpact(data);
                      const integrity = getIntegrityImpact(data);
                      const availability = getAvailabilityImpact(data);
                      
                      const ISS = 1 - ((1 - confidentiality) * (1 - integrity) * (1 - availability));
                      
                      // 1.2 Impact
                      let impact;
                      if (data.scope === 'U') {
                        // Scope = Unchanged
                        impact = 6.42 * ISS;
                      } else {
                        // Scope = Changed
                        impact = 7.52 * (ISS - 0.029) - 3.25 * Math.pow((ISS - 0.02), 15);
                      }
                      
                      // Step 2: Exploitability Subscore
                      const exploitability = 8.22 * getAttackVector(data) * getAttackComplexity(data) * getPrivilegesRequired(data) * getUserInteraction(data);
                      
                      // Step 3: Base Score Calculation
                      let baseScore;
                      if (impact <= 0) {
                        baseScore = 0;
                      } else {
                        if (data.scope === 'U') {
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
                      const vector = `CVSS:3.1/AV:${data.attackVector}/AC:${data.attackComplexity}/PR:${data.privilegesRequired}/UI:${data.userInteraction}/S:${data.scope}/C:${data.confidentiality}/I:${data.integrity}/A:${data.availability}`;
                      
                      return { score: baseScore, severity, vector };
                    };

                    const getAttackVector = (d: any) => {
                      switch (d.attackVector) {
                        case 'N': return 0.85;
                        case 'A': return 0.62;
                        case 'L': return 0.55;
                        case 'P': return 0.2;
                        default: return 0.85;
                      }
                    };

                    const getAttackComplexity = (d: any) => {
                      switch (d.attackComplexity) {
                        case 'L': return 0.77;
                        case 'H': return 0.44;
                        default: return 0.77;
                      }
                    };

                    const getPrivilegesRequired = (d: any) => {
                      switch (d.privilegesRequired) {
                        case 'N': return 0.85; // None - same for both scopes
                        case 'L': return d.scope === 'U' ? 0.62 : 0.68; // Low: 0.62 (Unchanged), 0.68 (Changed)
                        case 'H': return d.scope === 'U' ? 0.27 : 0.5; // High: 0.27 (Unchanged), 0.5 (Changed)
                        default: return 0.85;
                      }
                    };

                    const getUserInteraction = (d: any) => {
                      switch (d.userInteraction) {
                        case 'N': return 0.85;
                        case 'R': return 0.62;
                        default: return 0.85;
                      }
                    };

                    const getConfidentialityImpact = (d: any) => {
                      switch (d.confidentiality) {
                        case 'H': return 0.56;
                        case 'L': return 0.22;
                        case 'N': return 0;
                        default: return 0.56;
                      }
                    };

                    const getIntegrityImpact = (d: any) => {
                      switch (d.integrity) {
                        case 'H': return 0.56;
                        case 'L': return 0.22;
                        case 'N': return 0;
                        default: return 0.56;
                      }
                    };

                    const getAvailabilityImpact = (d: any) => {
                      switch (d.availability) {
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

                    const result = calculateCVSS();
                    
                    // Map CVSS severity to numeric severity values
                    const severityMap: { [key: string]: string } = {
                      'Critical': '1',
                      'High': '2', 
                      'Medium': '3',
                      'Low': '4',
                      'None': '5'
                    };
                    
                    setFormData(prev => ({
                      ...prev,
                      cvss_score: result.score.toString(),
                      cvss_severity: result.severity,
                      cvss_vector: result.vector,
                      // severity derived from cvss
                    }));
                  }} 
                />
              }

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" asChild>
                  <Link to={`/reports/${reportId}/bugs${searchParams.get('selected') ? `?selected=${searchParams.get('selected')}` : ''}`}>
                    Cancel
                  </Link>
                </Button>
                <Button type="submit" disabled={createBugMutation.isPending}>
                  {createBugMutation.isPending ? 'Creating...' : 'Create Bug'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddBug;
