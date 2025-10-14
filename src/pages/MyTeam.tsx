import React, { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCompanyUsers, useInviteCompanyUser, useRemoveCompanyUser, useToggleCompanyUserActive, useRoles, useAssignUserRole } from '@/hooks/useUsers';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const InviteUserModal = ({ onInvited }: { onInvited: () => void }) => {
  const inviteMutation = useInviteCompanyUser();
  const { data: roles = [] } = useRoles();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState<number | ''>('');
  const isValid = name.trim() && email.trim();

  const handleInvite = () => {
    const ids = typeof roleId === 'number' ? [roleId] : undefined;
    inviteMutation.mutate({ name: name.trim(), email: email.trim(), role_ids: ids }, {
      onSuccess: onInvited,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Invite User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="inv-name">Name</Label>
            <Input id="inv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alice Doe" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="inv-email">Email</Label>
            <Input id="inv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alice@example.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="inv-role">Role</Label>
            <select id="inv-role" className="h-9 px-3 rounded-md border border-input bg-background text-sm w-full" value={roleId as any} onChange={(e) => setRoleId(e.target.value ? parseInt(e.target.value, 10) : '')}>
              <option value="">Select role (optional)</option>
              {roles.map((r: any) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleInvite} disabled={!isValid || inviteMutation.isPending}>
            {inviteMutation.isPending ? 'Sending…' : 'Send Invite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const MyTeam: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'all'>('all');
  const { data, isLoading } = useCompanyUsers({ page, limit, search: search || undefined, status });
  const removeMutation = useRemoveCompanyUser();
  const toggleMutation = useToggleCompanyUserActive();

  const users = data?.data || [];
  const pagination = data?.pagination;

  const totalPages = pagination ? pagination.total_pages : 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-xl">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Team</h1>
            <p className="text-muted-foreground">Manage company users, invites and roles</p>
          </div>
        </div>
        <InviteUserModal onInvited={() => { /* list refresh handled by hook invalidation */ }} />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Input placeholder="Search name or email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="flex items-center gap-2">
              <select value={status} onChange={(e) => { setStatus(e.target.value as any); setPage(1); }} className="h-9 px-3 rounded-md border border-input bg-background text-sm">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }} className="h-9 px-3 rounded-md border border-input bg-background text-sm">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card Layout */}
      <div className="block lg:hidden space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        ) : (
          users.map(u => (
            <Card key={u.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-medium text-sm">
                        {u.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{u.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={u.is_2fa_enabled ? 'default' : 'secondary'} className="text-xs">
                      {u.is_2fa_enabled ? '2FA On' : '2FA Off'}
                    </Badge>
                    <Badge className={`text-xs ${u.is_active ? 'bg-green-500' : 'bg-gray-400'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Role</label>
                    <RoleSelector userId={u.id} currentRoleName={u.role} />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={toggleMutation.isPending} className="flex-1">
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{u.is_active ? 'Deactivate user?' : 'Activate user?'}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {u.is_active ? 'This will deactivate the user immediately. They will lose access until reactivated.' : 'This will activate the user and restore access.'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => toggleMutation.mutate({ userId: u.id, active: u.is_active })}>
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={removeMutation.isPending} className="flex-1">
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove user from company?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The user will be removed from this company and lose related access.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeMutation.mutate(u.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table Layout */}
      <Card className="hidden lg:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[220px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">No users found</TableCell></TableRow>
              ) : (
                users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-medium text-sm">
                            {u.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="capitalize">
                      <RoleSelector userId={u.id} currentRoleName={u.role} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.is_2fa_enabled ? 'default' : 'secondary'}>{u.is_2fa_enabled ? 'Enabled' : 'Disabled'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={u.is_active ? 'bg-green-500' : 'bg-gray-400'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={toggleMutation.isPending}>
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{u.is_active ? 'Deactivate user?' : 'Activate user?'}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {u.is_active ? 'This will deactivate the user immediately. They will lose access until reactivated.' : 'This will activate the user and restore access.'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => toggleMutation.mutate({ userId: u.id, active: u.is_active })}>
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={removeMutation.isPending}>
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove user from company?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. The user will be removed from this company and lose related access.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeMutation.mutate(u.id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination && pagination.total_pages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} users
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Previous</Button>
            <span className="text-sm px-2">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTeam;

// Inline component for role selection per user (single role)
const RoleSelector = ({ userId, currentRoleName }: { userId: number; currentRoleName?: string }) => {
  const { data: roles = [] } = useRoles();
  const assign = useAssignUserRole();
  const [selected, setSelected] = useState<string>(currentRoleName || '');
  const [pendingRole, setPendingRole] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const current = roles.find((r: any) => r.name.toLowerCase() === (selected || '').toLowerCase());

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value ? parseInt(e.target.value, 10) : NaN;
    setSelected(e.target.selectedOptions[0]?.text || '');
    if (!Number.isNaN(roleId)) {
      setPendingRole(roleId);
      setConfirmOpen(true);
    }
  };

  return (
    <>
      <select className="h-8 px-2 rounded-md border border-input bg-background text-sm" value={current?.id || ''} onChange={handleChange}>
        <option value="">Select role</option>
        {roles.map((r: any) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change user role?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change this user's role? This may affect their permissions immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (pendingRole) { assign.mutate({ userId, roleId: pendingRole }); } setConfirmOpen(false); }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};


