import { TrendingUp, TrendingDown, AlertTriangle, Bug, FileText, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/hooks/useDashboard';

export function DashboardStats() {
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load dashboard data</p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      title: 'Total Reports',
      value: dashboard.reports_count,
      description: 'Active vulnerability reports',
      icon: FileText,
      trend: 'stable',
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Total Vulnerabilities',
      value: dashboard.bugs_count,
      description: 'Identified security issues',
      icon: Bug,
      trend: dashboard.bugs_count > 15 ? 'up' : 'down',
      color: 'text-medium',
      bgColor: 'bg-medium/10',
    },
    {
      title: 'Critical Issues',
      value: dashboard.critical_bugs,
      description: 'Require immediate attention',
      icon: AlertTriangle,
      trend: dashboard.critical_bugs > 0 ? 'up' : 'down',
      color: 'text-critical',
      bgColor: 'bg-critical/10',
    },
    {
      title: 'Resolved Issues',
      value: dashboard.resolved_bugs,
      description: 'Successfully mitigated',
      icon: Shield,
      trend: dashboard.resolved_bugs > 3 ? 'up' : 'stable',
      color: 'text-low',
      bgColor: 'bg-low/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : null;
        
        return (
          <Card key={index} className="bg-gradient-card border-border/50 shadow-card hover:shadow-primary/20 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
                {TrendIcon && (
                  <TrendIcon 
                    className={`h-4 w-4 ${
                      stat.trend === 'up' 
                        ? stat.title === 'Resolved Issues' ? 'text-low' : 'text-critical'
                        : 'text-low'
                    }`} 
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}