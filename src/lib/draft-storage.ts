// Draft Bug Storage Utility
// Stores draft bug data in localStorage with 1-hour expiration

interface DraftBugData {
  reportId: number;
  title: string;
  domain: string;
  description: string;
  poc: string;
  fix: string;
  type: string;
  use_cvss: boolean;
  cvss_vector: string;
  cvss_score: string;
  cvss_severity: string;
  // CVSS breakdown fields
  attackVector: string;
  attackComplexity: string;
  privilegesRequired: string;
  userInteraction: string;
  scope: string;
  confidentiality: string;
  integrity: string;
  availability: string;
  draftAttachments: Array<{
    id: string | number;
    image_url: string;
    filename: string;
    size: number;
    type: string;
    created_at: string;
    is_draft: true;
  }>;
  timestamp: number; // When this draft was created/updated
}

const DRAFT_KEY_PREFIX = 'draft_bug_';
const EXPIRY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

// Generate a unique key for each report
const getDraftKey = (reportId: number): string => {
  return `${DRAFT_KEY_PREFIX}${reportId}`;
};

// Save draft bug data to localStorage
export const saveDraftBug = (reportId: number, formData: any, draftAttachments: any[] = []): void => {
  try {
    const draftData: DraftBugData = {
      reportId,
      title: formData.title || '',
      domain: formData.domain || '',
      description: formData.description || '',
      poc: formData.poc || '',
      fix: formData.fix || '',
      type: formData.type || '',
      use_cvss: formData.use_cvss || true,
      cvss_vector: formData.cvss_vector || '',
      cvss_score: formData.cvss_score || '',
      cvss_severity: formData.cvss_severity || '',
      attackVector: formData.attackVector || 'N',
      attackComplexity: formData.attackComplexity || 'L',
      privilegesRequired: formData.privilegesRequired || 'N',
      userInteraction: formData.userInteraction || 'N',
      scope: formData.scope || 'U',
      confidentiality: formData.confidentiality || 'N',
      integrity: formData.integrity || 'N',
      availability: formData.availability || 'N',
      draftAttachments,
      timestamp: Date.now()
    };

    const key = getDraftKey(reportId);
    localStorage.setItem(key, JSON.stringify(draftData));
    
    console.log('Draft bug data saved to localStorage');
  } catch (error) {
    console.error('Failed to save draft bug data:', error);
  }
};

// Load draft bug data from localStorage
export const loadDraftBug = (reportId: number): DraftBugData | null => {
  try {
    const key = getDraftKey(reportId);
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return null;
    }

    const draftData: DraftBugData = JSON.parse(stored);
    
    // Check if the draft has expired (older than 1 hour)
    const now = Date.now();
    const age = now - draftData.timestamp;
    
    if (age > EXPIRY_TIME) {
      console.log('Draft bug data expired, removing from localStorage');
      localStorage.removeItem(key);
      return null;
    }

    console.log('Draft bug data loaded from localStorage');
    return draftData;
  } catch (error) {
    console.error('Failed to load draft bug data:', error);
    return null;
  }
};

// Clear draft bug data from localStorage
export const clearDraftBug = (reportId: number): void => {
  try {
    const key = getDraftKey(reportId);
    localStorage.removeItem(key);
    console.log('Draft bug data cleared from localStorage');
  } catch (error) {
    console.error('Failed to clear draft bug data:', error);
  }
};

// Check if there's a valid draft for the report
export const hasValidDraft = (reportId: number): boolean => {
  return loadDraftBug(reportId) !== null;
};

// Get draft age in minutes (for display purposes)
export const getDraftAge = (reportId: number): number | null => {
  const draft = loadDraftBug(reportId);
  if (!draft) return null;
  
  const now = Date.now();
  const ageMs = now - draft.timestamp;
  return Math.floor(ageMs / (60 * 1000)); // Convert to minutes
};

// Auto-save draft data (debounced)
let saveTimeout: NodeJS.Timeout | null = null;

export const autoSaveDraft = (reportId: number, formData: any, draftAttachments: any[] = []): void => {
  // Clear existing timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  // Set new timeout to save after 2 seconds of inactivity
  saveTimeout = setTimeout(() => {
    saveDraftBug(reportId, formData, draftAttachments);
  }, 2000);
};
