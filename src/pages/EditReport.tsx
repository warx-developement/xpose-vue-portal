import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Users, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useReport, useUpdateReport, useDeleteReport, useAddUserAccess, useRemoveUserAccess } from '@/hooks/useReports';
import { useCompanyUsers } from '@/hooks/useUsers';
import { useAssets, useReportAsset, useAssignAssetToReport, useRemoveAssetFromReport } from '@/hooks/useAssets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export const EditReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reportId = parseInt(id || '0');

  const { data: report, isLoading, error } = useReport(reportId);
  const { data: usersData } = useCompanyUsers({ page: 1, limit: 100, status: 'all' });
  const users = usersData?.data || [];
  const updateReportMutation = useUpdateReport();
  const deleteReportMutation = useDeleteReport();
  const addUserAccessMutation = useAddUserAccess();
  const removeUserAccessMutation = useRemoveUserAccess();
  
  // Asset-related hooks
  const { data: assetsData, isLoading: isLoadingAssets } = useAssets({ page: 1, limit: 100 });
  const assets = assetsData?.data || [];
  const { data: currentAsset } = useReportAsset(reportId);
  const assignAssetMutation = useAssignAssetToReport();
  const removeAssetMutation = useRemoveAssetFromReport();

  const [formData, setFormData] = useState({
    name: '',
    scope: '',
  });
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Update form data when report loads
  useEffect(() => {
    if (report) {
      setFormData({
        name: report.name,
        scope: report.scope,
      });
    }
  }, [report]);

  // Update selected asset when current asset loads
  useEffect(() => {
    if (currentAsset?.data) {
      setSelectedAsset(currentAsset.data.id.toString());
    } else {
      setSelectedAsset('none');
    }
  }, [currentAsset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.scope.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    updateReportMutation.mutate({
      id: reportId,
      data: formData,
    }, {
      onSuccess: () => {
        navigate(`/reports/${reportId}`);
      }
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${report?.name}"? This action cannot be undone.`)) {
      deleteReportMutation.mutate(reportId, {
        onSuccess: () => {
          navigate('/reports');
        }
      });
    }
  };

  const handleAddUser = () => {
    if (selectedUserId) {
      addUserAccessMutation.mutate({
        reportId,
        userId: selectedUserId,
      }, {
        onSuccess: () => {
          setShowAddUser(false);
          setSelectedUserId(null);
        }
      });
    }
  };

  const handleRemoveUser = (userId: number) => {
    if (window.confirm('Are you sure you want to remove this user\'s access?')) {
      removeUserAccessMutation.mutate({
        reportId,
        userId,
      });
    }
  };

  const handleAssetChange = (assetId: string) => {
    setSelectedAsset(assetId);
    
    if (assetId === 'none') {
      // Remove current asset
      if (currentAsset?.data) {
        removeAssetMutation.mutate(reportId, {
          onSuccess: () => {
            toast({
              title: 'Success',
              description: 'Asset removed from report successfully',
            });
          },
          onError: () => {
            toast({
              title: 'Error',
              description: 'Failed to remove asset from report',
              variant: 'destructive',
            });
          },
        });
      }
    } else {
      // Assign new asset
      assignAssetMutation.mutate(
        { reportId, assetId: parseInt(assetId) },
        {
          onSuccess: () => {
            toast({
              title: 'Success',
              description: 'Asset assigned to report successfully',
            });
          },
          onError: () => {
            toast({
              title: 'Error',
              description: 'Failed to assign asset to report',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  // Filter available users (not already added)
  const availableUsers = users.filter(user => 
    !report?.access?.some(access => access.id === user.id)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-6" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
            <Link to={`/reports/${reportId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Report
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Report</h1>
            <p className="text-muted-foreground">Modify report details and manage access</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleteReportMutation.isPending}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Details Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Report Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter report name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scope">Scope *</Label>
                  <Textarea
                    id="scope"
                    value={formData.scope}
                    onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
                    placeholder="Describe the report scope"
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset">Asset (Optional)</Label>
                  <Select value={selectedAsset} onValueChange={handleAssetChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an asset to associate with this report" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingAssets ? (
                        <SelectItem value="" disabled>
                          Loading assets...
                        </SelectItem>
                      ) : assets.length === 0 ? (
                        <SelectItem value="" disabled>
                          No assets available
                        </SelectItem>
                      ) : (
                        <>
                          <SelectItem value="none">No asset selected</SelectItem>
                          {assets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id.toString()}>
                              {asset.name} ({asset.domains.join(', ')})
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Associate this report with an asset to enable subdomain analysis and reporting.
                  </p>
                  {currentAsset?.data && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Current Asset:</strong> {currentAsset.data.name} ({currentAsset.data.domains.join(', ')})
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={updateReportMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {updateReportMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to={`/reports/${reportId}`}>Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Team Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Access
              </span>
              {availableUsers.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddUser(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.access?.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveUser(user.id)}
                    disabled={removeUserAccessMutation.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {(!report.access || report.access.length === 0) && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No users have access to this report
                </p>
              )}

              {/* Add User Form */}
              {showAddUser && (
                <div className="border-t pt-3 mt-3 space-y-3">
                  <div>
                    <Label htmlFor="user-select">Select User</Label>
                    <select
                      id="user-select"
                      value={selectedUserId || ''}
                      onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm"
                    >
                      <option value="">Choose a user...</option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddUser}
                      disabled={!selectedUserId || addUserAccessMutation.isPending}
                    >
                      {addUserAccessMutation.isPending ? 'Adding...' : 'Add User'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddUser(false);
                        setSelectedUserId(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};