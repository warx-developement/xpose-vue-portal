import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  ArrowLeft, 
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
  ShieldCheck,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useCompany, useCompanyRoles, useCompanyActions } from '@/hooks/useCompanies';
import { CompanyForm } from '@/components/companies/CompanyForm';
import { UpdateCompanyRequest } from '@/lib/api';

export function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const companyId = id ? parseInt(id, 10) : 0;

  const [editingCompany, setEditingCompany] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState(false);
  const [deactivatingCompany, setDeactivatingCompany] = useState(false);

  const { company, loading: companyLoading, error: companyError, fetchCompany } = useCompany();
  const { roles, loading: rolesLoading, fetchRoles } = useCompanyRoles();
  const { updateCompany, deactivateCompany, deleteCompany } = useCompanyActions();

  useEffect(() => {
    if (companyId) {
      fetchCompany(companyId);
      fetchRoles(companyId);
    }
  }, [companyId, fetchCompany, fetchRoles]);

  const handleUpdateCompany = async (data: UpdateCompanyRequest) => {
    if (company) {
      const result = await updateCompany(company.id, data);
      if (result) {
        setEditingCompany(false);
        fetchCompany(companyId);
      }
    }
  };

  const handleDeactivateCompany = async () => {
    if (company) {
      const success = await deactivateCompany(company.id);
      if (success) {
        setDeactivatingCompany(false);
        fetchCompany(companyId);
      }
    }
  };

  const handleDeleteCompany = async () => {
    if (company) {
      const result = await deleteCompany(company.id);
      if (result.success) {
        setDeletingCompany(false);
        navigate('/superadmin/companies');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (company: any) => {
    if (company.is_deleted === 1) {
      return <Badge variant="destructive">Deleted</Badge>;
    }
    if (company.is_active === 0) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
  };

  if (companyLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  if (companyError || !company) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {companyError || 'Company not found'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link to="/superadmin/companies">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/superadmin/companies">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8" />
              {company.name}
            </h1>
            <p className="text-gray-600 mt-1">Company Details & Management</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(company)}
          <Button
            onClick={() => setEditingCompany(true)}
            variant="outline"
            size="sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Company Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Basic company details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Company Name</label>
                <p className="text-lg font-semibold text-gray-900">{company.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Domain</label>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a 
                    href={company.domain} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {company.domain}
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="text-gray-900">{company.address}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Contact Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a 
                    href={`mailto:${company.contact_email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {company.contact_email}
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a 
                    href={`tel:${company.contact_phone}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {company.contact_phone}
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              System Information
            </CardTitle>
            <CardDescription>
              System status and metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Company ID</label>
                <p className="text-lg font-mono text-gray-900">{company.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">UUID</label>
                <p className="text-sm font-mono text-gray-600 break-all">{company.uuid}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  {getStatusBadge(company)}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{formatDate(company.created_at)}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{formatDate(company.updated_at)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Company Roles
          </CardTitle>
          <CardDescription>
            Custom roles defined for this company
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rolesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No custom roles</h3>
              <p className="text-gray-500">This company doesn't have any custom roles defined.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="font-medium text-gray-900">{role.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-600">{role.description || 'No description'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {role.is_system_role === 1 ? (
                            <Badge variant="secondary">System Role</Badge>
                          ) : (
                            <Badge variant="outline">Custom Role</Badge>
                          )}
                          {role.is_admin_role === 1 && (
                            <Badge variant="default" className="bg-red-100 text-red-800">Admin</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600">{role.permission_count} permissions</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.is_active === 1 ? "default" : "secondary"}>
                          {role.is_active === 1 ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(role.created_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Company Actions
          </CardTitle>
          <CardDescription>
            Manage company status and perform administrative actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {company.is_active === 1 && company.is_deleted === 0 && (
              <Button
                onClick={() => setDeactivatingCompany(true)}
                variant="outline"
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                <ShieldOff className="w-4 h-4 mr-2" />
                Deactivate Company
              </Button>
            )}
            
            {company.is_active === 0 && company.is_deleted === 0 && (
              <Button
                onClick={() => setDeletingCompany(true)}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Permanently
              </Button>
            )}

            <Button
              onClick={() => {
                fetchCompany(companyId);
                fetchRoles(companyId);
              }}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          {/* Security Notice */}
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> Deactivating a company will prevent all users from accessing it. 
              Company admins must clean up all data before the company can be permanently deleted. 
              Permanent deletion only works when the company is completely empty.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Edit Company Form Modal */}
      {editingCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CompanyForm
              company={company}
              mode="edit"
              onSubmit={handleUpdateCompany}
              onCancel={() => setEditingCompany(false)}
            />
          </div>
        </div>
      )}

      {/* Deactivate Company Confirmation */}
      <AlertDialog open={deactivatingCompany} onOpenChange={setDeactivatingCompany}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{company.name}</strong>? 
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
      <AlertDialog open={deletingCompany} onOpenChange={setDeletingCompany}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{company.name}</strong>? 
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
