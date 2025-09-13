import React from 'react';
import { Bug, Edit, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const BugListItem = ({ bug, isSelected, onClick, onEdit, onStatus, onDelete }: { 
  bug: any; 
  isSelected: boolean; 
  onClick: () => void;
  onEdit: () => void;
  onStatus: () => void;
  onDelete: () => void;
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  };

  return (
    <div 
      className={`p-4 border-b cursor-pointer hover:bg-blue-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-600">{bug.status.label}</span>
            <Badge className={`text-xs ${getSeverityColor(bug.severity.label)}`}>
              {bug.severity.label}
            </Badge>
          </div>
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
            {bug.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {bug.domain}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-gray-500">{formatDate(bug.created_at)}</div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="Edit"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="Change Status"
            onClick={(e) => { e.stopPropagation(); onStatus(); }}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AllIssuesList = ({ 
  bugs, 
  isLoading, 
  selectedBugId, 
  onBugSelect, 
  onEdit, 
  onStatus, 
  onDelete 
}: {
  bugs: any[];
  isLoading: boolean;
  selectedBugId: number | null;
  onBugSelect: (bugId: number) => void;
  onEdit: (bugId: number) => void;
  onStatus: (bugId: number, status: number, severity: number) => void;
  onDelete: (bugId: number) => void;
}) => {
  return (
    <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-3 border rounded-lg">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))
      ) : bugs.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Bug className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No bugs found</p>
        </div>
      ) : (
        bugs.map((bug) => (
          <div key={bug.id} className="relative">
            <BugListItem
              bug={bug}
              isSelected={selectedBugId === bug.id}
              onClick={() => onBugSelect(bug.id)}
              onEdit={() => onEdit(bug.id)}
              onStatus={() => onStatus(bug.id, bug.status?.value ?? 0, bug.severity?.value ?? 0)}
              onDelete={() => onDelete(bug.id)}
            />
          </div>
        ))
      )}
    </div>
  );
};
