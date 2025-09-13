import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePermissions, useCreateRole, useUpdateRole } from '@/hooks/useRoles';
import { RoleData, CreateRoleRequest, UpdateRoleRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ArrowLeft, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

const roleFormSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100, 'Role name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission must be selected'),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  role?: RoleData;
  onCancel: () => void;
  onSuccess: () => void;
}

export const RoleForm: React.FC<RoleFormProps> = ({ role, onCancel, onSuccess }) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { data: permissions = [], isLoading: permissionsLoading, error: permissionsError } = usePermissions();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      permissions: role?.permissions?.map(p => p.slug) || [],
    },
  });

  const isEditing = !!role;
  const isSystemRole = Boolean(role?.is_system_role);
  const isAdminRole = Boolean(role?.is_admin_role);

  useEffect(() => {
    if (role?.permissions) {
      const permissionSlugs = role.permissions.map(p => p.slug);
      setSelectedPermissions(permissionSlugs);
      form.setValue('permissions', permissionSlugs);
    }
  }, [role, form]);

  const handlePermissionToggle = (permissionSlug: string, checked: boolean) => {
    let newPermissions: string[];
    if (checked) {
      newPermissions = [...selectedPermissions, permissionSlug];
    } else {
      newPermissions = selectedPermissions.filter(p => p !== permissionSlug);
    }
    setSelectedPermissions(newPermissions);
    form.setValue('permissions', newPermissions);
  };

  const handleSelectAllInModule = (modulePermissions: any[], checked: boolean) => {
    const moduleSlugs = modulePermissions.map(p => p.slug);
    let newPermissions: string[];
    
    if (checked) {
      // Add all module permissions that aren't already selected
      newPermissions = [...new Set([...selectedPermissions, ...moduleSlugs])];
    } else {
      // Remove all module permissions
      newPermissions = selectedPermissions.filter(p => !moduleSlugs.includes(p));
    }
    
    setSelectedPermissions(newPermissions);
    form.setValue('permissions', newPermissions);
  };

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (isEditing) {
        const updateData: UpdateRoleRequest = {
          name: data.name,
          description: data.description,
          permissions: data.permissions,
        };
        await updateRoleMutation.mutateAsync({ id: role.id, data: updateData });
      } else {
        const createData: CreateRoleRequest = {
          name: data.name,
          description: data.description,
          permissions: data.permissions,
        };
        await createRoleMutation.mutateAsync(createData);
      }
      onSuccess();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const isLoading = createRoleMutation.isPending || updateRoleMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Role' : 'Create Role'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update role details and permissions' : 'Create a new role with specific permissions'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Define the role name and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter role name" 
                        {...field} 
                        disabled={isSystemRole || isAdminRole}
                      />
                    </FormControl>
                    <FormDescription>
                      A unique name for this role (max 100 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter role description" 
                        {...field} 
                        disabled={isSystemRole || isAdminRole}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description for this role (max 500 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions
              </CardTitle>
              <CardDescription>
                Select the permissions for this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              {permissionsLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                      <div className="grid gap-2 pl-4">
                        {[...Array(2)].map((_, j) => (
                          <div key={j} className="flex items-start gap-3">
                            <Skeleton className="h-4 w-4 rounded" />
                            <div className="space-y-1 flex-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                      {i < 2 && <Skeleton className="h-px w-full" />}
                    </div>
                  ))}
                </div>
              ) : permissionsError ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load permissions</h3>
                  <p className="text-gray-600 mb-4">There was an error loading permissions. Please try again.</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {permissions.map((module) => {
                      const modulePermissions = module.permissions;
                      const selectedInModule = modulePermissions.filter(p => 
                        selectedPermissions.includes(p.slug)
                      );
                      const allSelected = selectedInModule.length === modulePermissions.length;
                      const someSelected = selectedInModule.length > 0;

                      return (
                        <div key={module.module} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 capitalize">
                                {module.module}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {selectedInModule.length}/{modulePermissions.length}
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectAllInModule(modulePermissions, !allSelected)}
                              disabled={isSystemRole || isAdminRole}
                            >
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </Button>
                          </div>
                          
                          <div className="grid gap-2 pl-4">
                            {modulePermissions.map((permission) => {
                              const isSelected = selectedPermissions.includes(permission.slug);
                              
                              return (
                                <div key={permission.id} className="flex items-start gap-3">
                                  <Checkbox
                                    id={permission.slug}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => 
                                      handlePermissionToggle(permission.slug, checked as boolean)
                                    }
                                    disabled={isSystemRole || isAdminRole}
                                  />
                                  <div className="space-y-1 flex-1">
                                    <label 
                                      htmlFor={permission.slug}
                                      className="text-sm font-medium text-gray-900 cursor-pointer"
                                    >
                                      {permission.name}
                                    </label>
                                    <p className="text-xs text-gray-600">
                                      {permission.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {module !== permissions[permissions.length - 1] && (
                            <Separator />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
              
              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Selected Permissions Summary */}
          {selectedPermissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Selected Permissions ({selectedPermissions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedPermissions.map((permissionSlug) => {
                    const permission = permissions
                      .flatMap(m => m.permissions)
                      .find(p => p.slug === permissionSlug);
                    
                    return (
                      <Badge key={permissionSlug} variant="secondary" className="text-xs">
                        {permission?.name || permissionSlug}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (isEditing ? 'Update Role' : 'Create Role')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
