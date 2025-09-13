import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Trash2, Calendar, Shield, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useReport } from '@/hooks/useReports';
import { useGeneratePDF, useDeletePDF, useReportPDFs } from '@/hooks/useDashboard';

interface PDFData {
  id: number;
  name: string;
  file_size: number | null;
  created_at: string;
  updated_at: string;
  file_url: string;
}

export const GenerateReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const reportId = parseInt(id || '0');
  
  const { data: report, isLoading: isLoadingReport, error: reportError } = useReport(reportId);
  const { data: pdfData = [], isLoading: isLoadingPDFs } = useReportPDFs(reportId);
  
  const generatePDFMutation = useGeneratePDF();
  const deletePDFMutation = useDeletePDF();

  const [reportName, setReportName] = useState('');
  const [reportPassword, setReportPassword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Set default report name when report data loads
  useEffect(() => {
    if (report) {
      setReportName(`${report.name} - Security Report`);
    }
  }, [report]);

  const handleGenerate = () => {
    if (reportId) {
      generatePDFMutation.mutate({
        reportId,
        data: {
          template: 'standard',
          include_comments: true,
          include_attachments: false,
          report_name: reportName,
          password: reportPassword || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined
        }
      });
    }
  };

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const handleDeleteFile = (pdfId: number) => {
    if (window.confirm('Are you sure you want to delete this PDF file?')) {
      deletePDFMutation.mutate(pdfId);
    }
  };

  const formatFileSize = (fileSize: number | null) => {
    if (!fileSize || fileSize === 0) return '0 MB';
    // File size is already in MB from the API
    return parseFloat(fileSize.toFixed(2)) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoadingReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (reportError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading report</p>
          <Button asChild>
            <Link to="/reports">Back to Reports</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Report not found</p>
          <Button asChild>
            <Link to="/reports">Back to Reports</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/reports/${report.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Report
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Generate Report</h1>
            <p className="text-muted-foreground">Generate a PDF report for {report.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name"
              />
            </div>

            <div>
              <Label htmlFor="password">Password (Optional)</Label>
              <Input
                id="password"
                type="password"
                value={reportPassword}
                onChange={(e) => setReportPassword(e.target.value)}
                placeholder="Enter password to protect PDF"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={generatePDFMutation.isPending || !reportName.trim()}
              className="w-full"
            >
              {generatePDFMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Generated Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[350px] overflow-y-auto">
            {isLoadingPDFs ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : pdfData.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No reports generated yet</p>
                <p className="text-sm text-gray-400 mt-1">Generate your first report using the configuration panel</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pdfData.map((pdf: any) => (
                  <div key={pdf.id} className={`p-4 border rounded-lg transition-colors ${
                    pdf.status === 'generating' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <FileText className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{pdf.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pdf.status === 'generating' ? (
                          <span className="text-sm text-blue-600 font-medium">Generating...</span>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(pdf.file_url)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteFile(pdf.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {pdf.status === 'generating' ? (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatFileSize(pdf.file_size)}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(pdf.created_at)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
