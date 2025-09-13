import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCompanyUsers, useInviteCompanyUser, useRemoveCompanyUser, useToggleCompanyUserActive, useRoles, useAssignUserRole } from '@/hooks/useUsers';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Team</h1>
          <p className="text-muted-foreground">Manage company users, invites and roles</p>
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

      <Card>
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
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading…</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">No users found</TableCell></TableRow>
              ) : (
                users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} users
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Previous</Button>
            <span className="text-sm">Page {page} of {totalPages}</span>
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


