import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBug, useBugTimeline } from '@/hooks/useBugs';

export const TimelineCard = ({ selectedBugId, height }: { selectedBugId: number | null; height?: number }) => {
  const { data: bug, isLoading: bugLoading } = useBug(selectedBugId || 0);
  const { data: timeline, isLoading: timelineLoading, error: timelineError } = useBugTimeline(selectedBugId || 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="flex flex-col" style={{ height: selectedBugId ? (height ? `${height + 100}px` : 'auto') : '750px' }}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-red-50 rounded-xl">
            <BarChart3 className="h-5 w-5 text-red-600" />
          </div>
          Timeline
        </CardTitle>
        <p className="text-sm text-gray-500">Issue timeline</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {selectedBugId ? (
          bugLoading || timelineLoading ? (
            <div className="flex-1 flex flex-col space-y-4 min-h-0">
              {/* Timeline Loading Skeleton */}
              <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
                <div className="space-y-4 p-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mt-1"></div>
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : timelineError ? (
            <div className="text-center text-gray-500 py-8">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Error loading timeline</p>
            </div>
          ) : bug && timeline ? (
            <div className="flex-1 flex flex-col space-y-4 min-h-0">
              {/* Timeline Content */}
              <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
                <div className="space-y-4 p-1">
                {timeline.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No timeline yet</p>
                  </div>
                ) : (
                  timeline.map((item, idx) => {
                    const dotColor = item.type === 'created' ? 'bg-blue-500' : item.type === 'system' ? 'bg-green-500' : 'bg-yellow-500';
                    const sevClass = (label: string) => {
                      const s = label.toLowerCase();
                      if (s === 'critical') return 'bg-red-100 text-red-800';
                      if (s === 'high') return 'bg-orange-100 text-orange-800';
                      if (s === 'medium') return 'bg-yellow-100 text-yellow-800';
                      if (s === 'low') return 'bg-green-100 text-green-800';
                      return 'bg-gray-100 text-gray-800';
                    };
                    const statusClass = (label: string) => {
                      const s = label.toLowerCase();
                      if (s === 'open') return 'bg-gray-100 text-gray-800';
                      if (s === 'pending') return 'bg-blue-100 text-blue-800';
                      if (s === 'accepted') return 'bg-green-100 text-green-800';
                      if (s === 'needs' || s === 'needs more info') return 'bg-cyan-100 text-cyan-800';
                      if (s === 'retesting') return 'bg-purple-100 text-purple-800';
                      if (s === 'resolved') return 'bg-gray-200 text-gray-900';
                      if (s === "won't" || s === "won't fix" || s === 'wont' || s === 'wont fix') return 'bg-gray-100 text-gray-800';
                      return 'bg-gray-100 text-gray-800';
                    };
                    const severityMatch = /Changed\s+severity\s+from\s+(\w+)\s+to\s+(\w+)/i.exec(item.title || '');
                    const statusMatch = /(?:Changed\s+status\s+from\s+)?([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+)/i.exec(item.title || '');
                    const isSeverityChange = item.type === 'system' && !!severityMatch;
                    const isStatusChange = item.type === 'system' && !!statusMatch && !isSeverityChange;
                    const isComment = item.type === 'comment';
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`w-3 h-3 ${dotColor} rounded-full mt-1`}></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(item.time)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {isComment ? (
                              <>
                                <span className="font-medium">{item.actor}</span> added a comment
                              </>
                            ) : isStatusChange ? (
                              <>
                                <span className="font-medium">{item.actor}</span> Changed status from{' '}
                                <Badge className={`px-2 py-0.5 ${statusClass(statusMatch![1].trim())} hover:bg-inherit hover:text-inherit`}>{statusMatch![1].trim()}</Badge>{' '}to{' '}
                                <Badge className={`px-2 py-0.5 ${statusClass(statusMatch![2].trim())} hover:bg-inherit hover:text-inherit`}>{statusMatch![2].trim()}</Badge>
                              </>
                            ) : isSeverityChange ? (
                              <>
                                <span className="font-medium">{item.actor}</span> Changed severity from{' '}
                                <Badge className={`px-2 py-0.5 ${sevClass(severityMatch![1])} hover:bg-inherit hover:text-inherit`}>{severityMatch![1]}</Badge>{' '}to{' '}
                                <Badge className={`px-2 py-0.5 ${sevClass(severityMatch![2])} hover:bg-inherit hover:text-inherit`}>{severityMatch![2]}</Badge>
                              </>
                            ) : (
                              <>
                                <span className="font-medium">{item.actor}</span> {item.title}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          ) : null
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Select a bug to view timeline</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
