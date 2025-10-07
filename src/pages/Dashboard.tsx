import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';

const StatCard = ({ title, value, icon, change, changeType, iconColor = 'blue' }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  iconColor?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'indigo';
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  return (
  <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                changeType === 'positive' ? 'bg-green-500' :
                changeType === 'negative' ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
              <p className={`text-xs font-medium ${
                changeType === 'positive' ? 'text-green-600' :
                changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {change}
              </p>
            </div>
          )}
        </div>
        <div className={`h-14 w-14 bg-gradient-to-br ${colorClasses[iconColor]} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <Skeleton className="h-4 w-20 mb-2 bg-gray-200" />
        <Skeleton className="h-8 w-16 mb-2 bg-gray-200" />
        <div className="flex items-center gap-1">
          <Skeleton className="w-2 h-2 rounded-full bg-gray-200" />
          <Skeleton className="h-3 w-12 bg-gray-200" />
        </div>
      </div>
      <Skeleton className="h-14 w-14 rounded-2xl bg-gray-200" />
    </div>
  </div>
);

const RecentActivitySkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-6 w-32 bg-gray-200" />
      <Skeleton className="h-8 w-20 bg-gray-200" />
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 bg-gray-200" />
            <Skeleton className="h-3 w-1/2 bg-gray-200" />
          </div>
          <Skeleton className="h-5 w-16 bg-gray-200" />
        </div>
      ))}
    </div>
  </div>
);

const VulnerabilitySkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-6 w-40 bg-gray-200" />
      <Skeleton className="h-8 w-20 bg-gray-200" />
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16 bg-gray-200" />
            <Skeleton className="h-4 w-8 bg-gray-200" />
          </div>
          <Skeleton className="h-4 w-12 bg-gray-200" />
        </div>
      ))}
    </div>
  </div>
);

const SeverityBadge = ({ severity }: { severity: string }) => {
  const getVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };
  
  return (
    <Badge variant={getVariant(severity)} className="px-2 py-1 text-xs font-medium">
      {severity}
    </Badge>
  );
};

export default function Dashboard() {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();

  if (dashboardLoading) {
    return (
      <div>
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivitySkeleton />
          <VulnerabilitySkeleton />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Reports"
          value={dashboardData?.reports_count || 0}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 3V9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>}
          change="+12% from last month"
          changeType="positive"
          iconColor="blue"
        />
        <StatCard
          title="Active Bugs"
          value={dashboardData?.bugs_count || 0}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>}
          change={`${dashboardData?.bugs_count || 0} open issues`}
          changeType="negative"
          iconColor="orange"
        />
        <StatCard
          title="Critical Issues"
          value={dashboardData?.critical_bugs || 0}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>}
          change="Requires immediate attention"
          changeType="negative"
          iconColor="red"
        />
        <StatCard
          title="Resolved Bugs"
          value={dashboardData?.resolved_bugs || 0}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M9 12L11 14L15 10M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>}
          change="Successfully resolved"
          changeType="positive"
          iconColor="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bugs by Severity Chart */}
        <div className="group relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 via-transparent to-orange-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Bugs by Severity</h3>
              <div className="h-8 w-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div className="space-y-3">
              {dashboardData?.bugs_by_severity ? Object.entries(dashboardData.bugs_by_severity).map(([severity, count]) => (
                <div key={severity} className="group/item flex items-center justify-between p-2 rounded-lg hover:bg-gray-50/50 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={severity} />
                    <span className="text-sm font-medium text-gray-700">{severity}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-28 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 group-hover/item:scale-105 ${
                          severity === 'Critical' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          severity === 'High' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                          severity === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                          severity === 'Low' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'
                        }`}
                        style={{ width: `${(count / Math.max(...Object.values(dashboardData.bugs_by_severity))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-sm">No data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bug Status Overview */}
        <div className="group relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Bug Status Overview</h3>
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M9 19C7 19 5 17 5 15C5 13 7 11 9 11C11 11 13 13 13 15C13 17 11 19 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 19C17 19 19 17 19 15C19 13 17 11 15 11C13 11 11 13 11 15C11 17 13 19 15 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div className="space-y-3">
              {dashboardData?.bugs_by_status ? Object.entries(dashboardData.bugs_by_status).map(([status, count]) => (
                <div key={status} className="group/item flex items-center justify-between p-2 rounded-lg hover:bg-gray-50/50 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'Open' ? 'bg-red-500' :
                      status === 'Pending' ? 'bg-yellow-500' :
                      status === 'Accepted' ? 'bg-blue-500' :
                      status === 'Needs More Info' ? 'bg-orange-500' :
                      status === 'Retesting' ? 'bg-purple-500' :
                      status === 'Resolved' ? 'bg-green-500' :
                      status === 'Won\'t Fix' ? 'bg-gray-500' :
                      status === 'In Progress' ? 'bg-yellow-500' :
                      status === 'Closed' ? 'bg-gray-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">{status}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-28 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 group-hover/item:scale-105"
                        style={{ width: `${count > 0 ? (count / Math.max(...Object.values(dashboardData.bugs_by_status))) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-sm">No data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports */}
        <div className="group relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 via-transparent to-emerald-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 3V9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {dashboardData?.recent_reports ? dashboardData.recent_reports.slice(0, 4).map((report) => (
                <div key={report.id} className="group/item p-3 border border-gray-100 rounded-lg hover:bg-gray-50/80 hover:border-gray-200 transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm leading-5 pr-2">{report.name}</h4>
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">by {report.created_by}</span>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 3V9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-sm">No reports available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Bugs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bugs</h3>
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
          </div>
          <div className="space-y-3">
            {dashboardData?.recent_bugs ? dashboardData.recent_bugs.slice(0, 4).map((bug) => (
              <div key={bug.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-gray-900 text-sm pr-2">{bug.title}</h4>
                  <SeverityBadge severity={bug.severity} />
                </div>
                <p className="text-xs text-gray-500 mb-1">{bug.domain}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">by {bug.created_by}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(bug.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-8">No recent bugs</div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}