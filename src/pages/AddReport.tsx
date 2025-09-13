import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, Search, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCompanyUsers } from '@/hooks/useUsers';
import { useCreateReport } from '@/hooks/useReports';

export const AddReport: React.FC = () => {
  const navigate = useNavigate();
  const { data: usersData, isLoading: isLoadingUsers } = useCompanyUsers({ page: 1, limit: 100, status: 'all' });
  const users = usersData?.data || [];
  const createReportMutation = useCreateReport();

  const [formData, setFormData] = useState({
    name: '',
    scope: '',
  });
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter((user: any) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.scope.trim() || selectedUsers.length === 0) return;
    createReportMutation.mutate({
      name: formData.name.trim(),
      scope: formData.scope.trim(),
      userAccess: selectedUsers,
    }, {
      onSuccess: () => {
        navigate('/reports');
      }
    });
  };

  const toggleUser = (user: any) => {
    const exists = selectedUsers.some(u => u.id === user.id);
    setSelectedUsers(prev => exists ? prev.filter(u => u.id !== user.id) : [...prev, user]);
  };

  const removeUser = (userId: number) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const isFormValid = formData.name.trim() && formData.scope.trim() && selectedUsers.length > 0;

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
            <h1 className="text-2xl font-bold tracking-tight">Add Report</h1>
            <p className="text-muted-foreground">Create a new report and grant access</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Details */}
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

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={!isFormValid || createReportMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {createReportMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Create Report
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to="/reports">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Team Access */}
        <Card>
          <CardHeader>
            <CardTitle>Team Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">User Access</Label>
              <div className="relative">
                <div
                  className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20 transition-all duration-200 bg-white focus-within:bg-white"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  <div className="flex flex-wrap gap-1 flex-1">
                    {selectedUsers.length === 0 ? (
                      <span className="text-gray-500">Select users...</span>
                    ) : (
                      selectedUsers.map((user: any) => (
                        <Badge key={user.id} variant="secondary" className="flex items-center gap-1 pr-1">
                          {user.name}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeUser(user.id); }}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isUserDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 h-9 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {isLoadingUsers ? (
                        <div className="p-3 text-center text-gray-500 text-sm">Loading users...</div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="p-3 text-center text-gray-500 text-sm">No users found</div>
                      ) : (
                        filteredUsers.map((user: any) => {
                          const isSelected = selectedUsers.some(u => u.id === user.id);
                          return (
                            <div
                              key={user.id}
                              className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${isSelected ? 'bg-blue-50/50 border-l-2 border-blue-400' : ''}`}
                              onClick={() => toggleUser(user)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white text-sm font-medium">
                                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-800">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
              {selectedUsers.length === 0 && (
                <p className="text-sm text-red-500">Please select at least one user</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddReport;


