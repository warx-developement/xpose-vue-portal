import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useCompanies, useCompanyActions } from '@/hooks/useCompanies';
import { Company } from '@/lib/api';
import { CompanyForm } from '@/components/companies/CompanyForm';
import { CreateCompanyRequest, UpdateCompanyRequest } from '@/lib/api';

export function CompanyList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [deactivatingCompany, setDeactivatingCompany] = useState<Company | null>(null);

  const { companies, loading, error, pagination, fetchCompanies, refreshCompanies } = useCompanies({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const { createCompany, updateCompany, deactivateCompany, deleteCompany } = useCompanyActions();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchCompanies({
      page: 1,
      limit: 10,
      search: value,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
  };

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    fetchCompanies({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      sort_by: field,
      sort_order: newOrder,
    });
  };

  const handleCreateCompany = async (data: CreateCompanyRequest) => {
    const result = await createCompany(data);
    if (result) {
      setShowCreateForm(false);
      refreshCompanies();
    }
  };

  const handleUpdateCompany = async (data: UpdateCompanyRequest) => {
    if (editingCompany) {
      const result = await updateCompany(editingCompany.id, data);
      if (result) {
        setEditingCompany(null);
        refreshCompanies();
      }
    }
  };

  const handleDeactivateCompany = async () => {
    if (deactivatingCompany) {
      const success = await deactivateCompany(deactivatingCompany.id);
      if (success) {
        setDeactivatingCompany(null);
        refreshCompanies();
      }
    }
  };

  const handleDeleteCompany = async () => {
    if (deletingCompany) {
      const result = await deleteCompany(deletingCompany.id);
      if (result.success) {
        setDeletingCompany(null);
        refreshCompanies();
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (company: Company) => {
    if (company.is_deleted === 1) {
      return <Badge variant="destructive">Deleted</Badge>;
    }
    if (company.is_active === 0) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
          <p className="text-gray-600 mt-1">Manage all companies in the system</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Company
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Companies ({pagination?.total || 0})
          </CardTitle>
          <CardDescription>
            Manage company accounts and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating a new company'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateForm(true)} className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Company
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('name')}
                    >
                      Company Name
                      {sortBy === 'name' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('created_at')}
                    >
                      Created
                      {sortBy === 'created_at' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{company.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {company.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-900">{company.contact_email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-500">{company.contact_phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="w-3 h-3 text-gray-400" />
                          <a 
                            href={company.domain} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm truncate max-w-32"
                          >
                            {company.domain}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(company)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(company.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/superadmin/companies/${company.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingCompany(company)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Company
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {company.is_active === 1 && company.is_deleted === 0 && (
                              <DropdownMenuItem 
                                onClick={() => setDeactivatingCompany(company)}
                                className="text-orange-600"
                              >
                                <ShieldOff className="w-4 h-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            )}
                            {company.is_active === 0 && company.is_deleted === 0 && (
                              <DropdownMenuItem 
                                onClick={() => setDeletingCompany(company)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Permanently
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
            {pagination.total} companies
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage(prev => Math.max(1, prev - 1));
                fetchCompanies({
                  page: Math.max(1, currentPage - 1),
                  limit: 10,
                  search: searchTerm,
                  sort_by: sortBy,
                  sort_order: sortOrder,
                });
              }}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage(prev => prev + 1);
                fetchCompanies({
                  page: currentPage + 1,
                  limit: 10,
                  search: searchTerm,
                  sort_by: sortBy,
                  sort_order: sortOrder,
                });
              }}
              disabled={currentPage >= (pagination.total_pages || 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Company Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CompanyForm
              mode="create"
              onSubmit={handleCreateCompany}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Company Form Modal */}
      {editingCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CompanyForm
              company={editingCompany}
              mode="edit"
              onSubmit={handleUpdateCompany}
              onCancel={() => setEditingCompany(null)}
            />
          </div>
        </div>
      )}

      {/* Deactivate Company Confirmation */}
      <AlertDialog open={!!deactivatingCompany} onOpenChange={() => setDeactivatingCompany(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{deactivatingCompany?.name}</strong>? 
              This will prevent all users from accessing the company. Company admins must clean up 
              all data before the company can be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeactivateCompany}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Deactivate Company
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Company Confirmation */}
      <AlertDialog open={!!deletingCompany} onOpenChange={() => setDeletingCompany(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{deletingCompany?.name}</strong>? 
              This action cannot be undone. The company must be deactivated and completely empty 
              (no users, reports, bugs, assets, comments, or custom roles) before it can be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCompany}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
