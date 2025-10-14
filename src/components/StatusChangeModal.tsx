import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useUpdateBugStatus } from '../hooks/useBugs';
import { X } from 'lucide-react';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bugId: number;
  currentStatus?: number;
}

const statusOptions = [
  { value: 0, label: 'Open', color: 'bg-gray-700 text-white' },
  { value: 1, label: 'Pending', color: 'bg-blue-100 text-blue-800' },
  { value: 2, label: 'Accepted', color: 'bg-green-100 text-green-800' },
  { value: 3, label: 'Needs More Info', color: 'bg-cyan-100 text-cyan-800' },
  { value: 4, label: 'Retesting', color: 'bg-purple-100 text-purple-800' },
  { value: 5, label: 'Resolved', color: 'bg-gray-800 text-white' },
  { value: 6, label: "Won't Fix", color: 'bg-gray-700 text-white' },
];


export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  bugId,
  currentStatus = 0,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<number>(currentStatus);
  const updateBugStatusMutation = useUpdateBugStatus();

  // Update state when current values change or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
    }
  }, [isOpen, currentStatus]);

  const handleSubmit = async () => {
    try {
      await updateBugStatusMutation.mutateAsync({
        bugId,
        status: selectedStatus,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update bug status:', error);
    }
  };

  const handleClose = () => {
    // Reset to current values when closing without saving
    setSelectedStatus(currentStatus);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90vw] max-w-sm mx-auto p-4">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            Change Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Status Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="grid grid-cols-2 gap-1.5">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                    selectedStatus === option.value
                      ? option.color
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="bg-red-100 text-red-800 hover:bg-red-200 w-full text-xs"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={updateBugStatusMutation.isPending}
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 w-full text-xs"
            >
              {updateBugStatusMutation.isPending ? 'Updating...' : 'Submit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
