import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Bug, Target, Edit, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useReport } from '@/hooks/useReports';

export const ViewReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const reportId = parseInt(id || '0');
  
  const { data: report, isLoading, error } = useReport(reportId);

  // Get security grade color scheme
  const getSecurityGradeColors = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A':
        return {
          background: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'text-green-600',
          badge: 'bg-green-500'
        };
      case 'B':
        return {
          background: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-600',
          badge: 'bg-blue-500'
        };
      case 'C':
        return {
          background: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-500'
        };
      case 'D':
        return {
          background: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          icon: 'text-orange-600',
          badge: 'bg-orange-500'
        };
      case 'F':
        return {
          background: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-600',
          badge: 'bg-red-500'
        };
      default:
        return {
          background: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-600',
          badge: 'bg-gray-500'
        };
    }
  };

  const securityColors = getSecurityGradeColors(report?.security_grade?.grade || 'A');

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
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
            <Link to="/reports">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{report.name}</h1>
            <p className="text-muted-foreground">Created by {report.created_by}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/reports/${report.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Report
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/reports/${report.id}/generate`}>
              <FileText className="h-4 w-4 mr-2" />
              Generate PDF
            </Link>
          </Button>
        </div>
      </div>

      {/* Top Row - 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Grade Card */}
        <Card className={`${securityColors.background} ${securityColors.border} hover:shadow-lg transition-all duration-300`}>
          <CardContent className="p-6 flex flex-col items-center justify-center h-full">
            <h3 className="text-lg font-semibold mb-4">Security Grade</h3>
            <div className="flex flex-col items-center gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className={`text-4xl font-bold ${securityColors.icon}`}>
                  {report.security_grade?.grade || 'A'}
                </span>
                <div className={`w-12 h-12 ${securityColors.badge} rounded-full flex items-center justify-center`}>
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <p className={`text-sm ${securityColors.text} text-center`}>
              {report.security_grade?.description || 'Very good security posture'}
            </p>
          </CardContent>
        </Card>

        {/* Vulnerabilities Card */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Vulnerabilities</h3>
              <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800 transition-colors" asChild>
                <Link to={`/reports/${report.id}/bugs`}>
                  See all →
                </Link>
              </Button>
            </div>
            <div className="text-4xl font-bold mb-4">
              {report.vulnerabilities_summary?.total || 0}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-red-50 p-3 rounded text-center hover:bg-red-100 transition-colors duration-200">
                <div className="text-lg font-bold text-red-600">
                  {report.vulnerabilities_summary?.critical || 0}
                </div>
                <div className="text-xs text-red-600">Critical</div>
              </div>
              <div className="bg-orange-50 p-3 rounded text-center hover:bg-orange-100 transition-colors duration-200">
                <div className="text-lg font-bold text-orange-600">
                  {report.vulnerabilities_summary?.high || 0}
                </div>
                <div className="text-xs text-orange-600">High</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded text-center hover:bg-yellow-100 transition-colors duration-200">
                <div className="text-lg font-bold text-yellow-600">
                  {report.vulnerabilities_summary?.medium || 0}
                </div>
                <div className="text-xs text-yellow-600">Medium</div>
              </div>
              <div className="bg-green-50 p-3 rounded text-center hover:bg-green-100 transition-colors duration-200">
                <div className="text-lg font-bold text-green-600">
                  {report.vulnerabilities_summary?.low || 0}
                </div>
                <div className="text-xs text-green-600">Low</div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {report.vulnerabilities_summary?.info || 0} vulnerabilities are info
            </p>
          </CardContent>
        </Card>

        {/* Fixed Vulnerabilities Card */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Fixed Vulnerabilities</h3>
              <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800 transition-colors" asChild>
                <Link to={`/reports/${report.id}/bugs`}>
                  See all →
                </Link>
              </Button>
            </div>
            <div className="text-4xl font-bold mb-4">
              {report.vulnerabilities_summary?.resolved || 0}/{report.vulnerabilities_summary?.total || 0}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Critical</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-red-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 transition-all duration-1000 ease-out" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {report.vulnerabilities_summary?.critical ? 'N/A% Fixed' : 'N/A% Fixed'} ({report.vulnerabilities_summary?.resolved || 0}/{report.vulnerabilities_summary?.critical || 0})
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">High</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-orange-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all duration-1000 ease-out" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {report.vulnerabilities_summary?.high ? '0% Fixed' : 'N/A% Fixed'} ({report.vulnerabilities_summary?.resolved || 0}/{report.vulnerabilities_summary?.high || 0})
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Medium</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-yellow-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 transition-all duration-1000 ease-out" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {report.vulnerabilities_summary?.medium ? 'N/A% Fixed' : 'N/A% Fixed'} ({report.vulnerabilities_summary?.resolved || 0}/{report.vulnerabilities_summary?.medium || 0})
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Low</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-green-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-1000 ease-out" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {report.vulnerabilities_summary?.low ? '0% Fixed' : 'N/A% Fixed'} ({report.vulnerabilities_summary?.resolved || 0}/{report.vulnerabilities_summary?.low || 0})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Vulnerable Target Card (Horizontal Bar Chart) */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Top Vulnerable Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.top_vulnerable_targets && report.top_vulnerable_targets.length > 0 ? (
              <div className="space-y-3">
                {(() => {
                  const items = report.top_vulnerable_targets.slice(0, 5);
                  const max = Math.max(...items.map((t: any) => t.count || 0), 1);
                  return items.map((t: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 truncate font-mono">{t.domain}</div>
                        <div className="relative h-3 mt-1 bg-gray-100 rounded">
                          <div className="absolute inset-y-0 left-0 bg-blue-500 rounded" style={{ width: `${(t.count / max) * 100}%` }} />
                        </div>
                      </div>
                      <div className="w-6 text-right text-sm font-medium">{t.count}</div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <div className="text-center p-4 text-gray-500">No vulnerable targets found</div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Vulnerability Category Card (Donut + Legend) */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-600" />
              Top Vulnerability Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.top_vulnerability_categories && report.top_vulnerability_categories.length > 0 ? (
              <div className="flex items-center gap-6">
                {(() => {
                  const items = report.top_vulnerability_categories.slice(0, 5);
                  const total = items.reduce((s: number, i: any) => s + (i.count || 0), 0) || 1;
                  const palette = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6'];
                  let acc = 0;
                  const segments = items.map((i: any, idx: number) => {
                    const start = acc;
                    const pct = (i.count / total) * 100;
                    acc += pct;
                    return `${palette[idx % palette.length]} ${start}% ${acc}%`;
                  }).join(', ');
                  const centerPct = Math.round((items[0]?.count || 0) / total * 100);
                  return (
                    <div className="relative w-36 h-36">
                      <div className="w-36 h-36 rounded-full" style={{ background: `conic-gradient(${segments})` }} />
                      <div className="absolute inset-6 rounded-full bg-white border flex items-center justify-center text-sm font-medium">{centerPct}%</div>
                    </div>
                  );
                })()}
                <div className="flex-1 space-y-2 text-sm">
                  {(() => {
                    const items = report.top_vulnerability_categories.slice(0, 5);
                    const total = items.reduce((s: number, i: any) => s + (i.count || 0), 0) || 1;
                    const palette = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6'];
                    return items.map((i: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: palette[idx % palette.length] }} />
                          <span className="truncate" title={i.category}>{i.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">{Math.round((i.count / total) * 100)}%</span>
                          <span className="font-medium w-6 text-right">{i.count}</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ) : (
              <div className="text-center p-4 text-gray-500">No vulnerability categories found</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status/Severity Chart - Heatmap Style */}
      {report.status_severity_matrix && Object.keys(report.status_severity_matrix).length > 0 && (
        <Card className="mt-6 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Status/Severity Chart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Severity</th>
                    <th className="text-center p-2 font-medium">OPEN</th>
                    <th className="text-center p-2 font-medium">PEND..</th>
                    <th className="text-center p-2 font-medium">ACCEP..</th>
                    <th className="text-center p-2 font-medium">NEED..</th>
                    <th className="text-center p-2 font-medium">RETES..</th>
                    <th className="text-center p-2 font-medium">RESOL..</th>
                    <th className="text-center p-2 font-medium">WONT..</th>
                    <th className="text-center p-2 font-medium">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.status_severity_matrix).map(([severity, statusCounts]) => (
                    <tr key={severity} className="border-b hover:bg-gray-50 transition-colors duration-200">
                      <td className="p-3 font-medium">{severity}</td>
                      <td className="text-center p-2">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                          severity === 'Critical' ? 'bg-red-100 text-red-800' :
                          severity === 'High' ? 'bg-orange-100 text-orange-800' :
                          severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          severity === 'Low' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {statusCounts.Open || 0}
                        </div>
                      </td>
                      <td className="text-center p-2">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                          severity === 'Critical' ? 'bg-red-50 text-red-600' :
                          severity === 'High' ? 'bg-orange-50 text-orange-600' :
                          severity === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                          severity === 'Low' ? 'bg-green-50 text-green-600' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {statusCounts.Pending || 0}
                        </div>
                      </td>
                      <td className="text-center p-2">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                          severity === 'Critical' ? 'bg-red-50 text-red-600' :
                          severity === 'High' ? 'bg-orange-50 text-orange-600' :
                          severity === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                          severity === 'Low' ? 'bg-green-50 text-green-600' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {statusCounts.Accepted || 0}
                        </div>
                      </td>
                      <td className="text-center p-2">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                          severity === 'Critical' ? 'bg-red-50 text-red-600' :
                          severity === 'High' ? 'bg-orange-50 text-orange-600' :
                          severity === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                          severity === 'Low' ? 'bg-green-50 text-green-600' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {statusCounts['Needs More Info'] || 0}
                        </div>
                      </td>
                      <td className="text-center p-2">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                          severity === 'Critical' ? 'bg-red-50 text-red-600' :
                          severity === 'High' ? 'bg-orange-50 text-orange-600' :
                          severity === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                          severity === 'Low' ? 'bg-green-50 text-green-600' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {statusCounts.Retesting || 0}
                        </div>
                      </td>
                      <td className="text-center p-2">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                          severity === 'Critical' ? 'bg-red-50 text-red-600' :
                          severity === 'High' ? 'bg-orange-50 text-orange-600' :
                          severity === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                          severity === 'Low' ? 'bg-green-50 text-green-600' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {statusCounts.Resolved || 0}
                        </div>
                      </td>
                      <td className="text-center p-2">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                          severity === 'Critical' ? 'bg-red-50 text-red-600' :
                          severity === 'High' ? 'bg-orange-50 text-orange-600' :
                          severity === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                          severity === 'Low' ? 'bg-green-50 text-green-600' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {statusCounts["Won't Fix"] || 0}
                        </div>
                      </td>
                      <td className="text-center p-2">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {statusCounts.Total || 0}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};