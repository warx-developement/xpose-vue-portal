import { formatDistanceToNow } from 'date-fns';
import { Activity, Bug, FileText, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/useDashboard';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'bug_created':
      return Bug;
    case 'report_created':
      return FileText;
    case 'bug_resolved':
      return Shield;
    case 'critical_issue':
      return AlertTriangle;
    default:
      return Activity;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'bug_created':
      return 'text-medium bg-medium/10';
    case 'report_created':
      return 'text-info bg-info/10';
    case 'bug_resolved':
      return 'text-low bg-low/10';
    case 'critical_issue':
      return 'text-critical bg-critical/10';
    default:
      return 'text-muted-foreground bg-muted/10';
  }
};

const getActivityBadge = (type: string) => {
  switch (type) {
    case 'bug_created':
      return { text: 'New Bug', variant: 'secondary' as const };
    case 'report_created':
      return { text: 'New Report', variant: 'default' as const };
    case 'bug_resolved':
      return { text: 'Resolved', variant: 'outline' as const };
    case 'critical_issue':
      return { text: 'Critical', variant: 'destructive' as const };
    default:
      return { text: 'Activity', variant: 'secondary' as const };
  }
};

export function RecentActivity() {
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest security events and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !dashboard) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-center py-4">Failed to load recent activity</p>
        </CardContent>
      </Card>
    );
  }

  if (!dashboard.recent_activity || dashboard.recent_activity.length === 0) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest security events and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest security events and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dashboard.recent_activity.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            const badge = getActivityBadge(activity.type);
            const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });

            return (
              <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/20 transition-colors group">
                <div className={`p-2 rounded-full ${colorClass} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.description}
                    </p>
                    <Badge variant={badge.variant} className="ml-2 text-xs">
                      {badge.text}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{timeAgo}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}