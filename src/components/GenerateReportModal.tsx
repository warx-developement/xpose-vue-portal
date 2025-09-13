import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface PDFData {
  id: number;
  start_date: string;
  end_date: string;
  file_url: string;
  file_size: number;
  status: string;
  created_at: string;
  updated_at: string;
  download_url: string;
}

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: number;
  pdfData?: PDFData[];
  isLoadingPDFs?: boolean;
  isGeneratingPDF?: boolean;
  onGeneratePDF?: (data: { template?: string; include_comments?: boolean; include_attachments?: boolean; }) => void;
  onDeletePDF?: (pdfId: number) => void;
}

export const GenerateReportModal: React.FC<GenerateReportModalProps> = ({ 
  isOpen, 
  onClose, 
  reportId, 
  pdfData = [],
  isLoadingPDFs = false,
  isGeneratingPDF = false,
  onGeneratePDF,
  onDeletePDF
}) => {
  const [reportName, setReportName] = useState('');
  const [reportPassword, setReportPassword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Use requestAnimationFrame to ensure DOM is ready for animation
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // Delay hiding the component until animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleGenerate = () => {
    if (onGeneratePDF) {
      onGeneratePDF({
        template: 'standard',
        include_comments: true,
        include_attachments: false
      });
    }
  };

  const handleDownload = (fileUrl: string) => {
    // Handle PDF download
    window.open(fileUrl, '_blank');
  };

  const handleDeleteFile = (pdfId: number) => {
    if (onDeletePDF) {
      onDeletePDF(pdfId);
    }
  };

  const formatFileSize = (fileSize: number | null) => {
    if (!fileSize || fileSize === 0) return '0 MB';
    // File size is already in MB from the API
    return parseFloat(fileSize.toFixed(2)) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
          isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      ></div>
      <div className={`absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isAnimating ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Generate Report</h2>
                <p className="text-sm text-gray-600">Generate a report for the selected project</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Report Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Report Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Password (Optional)</label>
                <input
                  type="password"
                  value={reportPassword}
                  onChange={(e) => setReportPassword(e.target.value)}
                  placeholder="PDF Password (Optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Project Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Start Date (Optional)</label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Project End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project End Date (Optional)</label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGeneratingPDF}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </button>

            {/* Generated Files */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Files {pdfData.length > 0 && `(${pdfData.length})`}
              </h3>
              
              {isLoadingPDFs ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-lg bg-gray-200" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32 bg-gray-200" />
                          <Skeleton className="h-3 w-24 bg-gray-200" />
                          <Skeleton className="h-3 w-16 bg-gray-200" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded bg-gray-200" />
                        <Skeleton className="h-6 w-6 rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : pdfData.length > 0 ? (
                <div className="space-y-3">
                  {pdfData.map((pdf) => (
                    <div key={pdf.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-600">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Report {pdf.id} - {pdf.start_date} to {pdf.end_date}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(pdf.file_size)} • {formatDate(pdf.created_at)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              pdf.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pdf.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(pdf.file_url)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Download PDF"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteFile(pdf.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Delete PDF"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="p-3 bg-gray-100 rounded-lg w-fit mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-sm">No generated reports yet</p>
                  <p className="text-xs text-gray-400 mt-1">Generate a report to see it here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
