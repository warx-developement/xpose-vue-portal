import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { Loader2, User, Mail, Building, Shield, CheckCircle } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileInfo: React.FC = () => {
  const { data: user, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  // Update form when profile data loads
  React.useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync({ name: data.name, email: data.email });
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCancel = () => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const hasChanges = watch('name') !== user?.name || watch('email') !== user?.email;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Basic Info Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
          </div>

          {/* Company Information Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-gray-500">Failed to load profile information</p>
        </CardContent>
      </Card>
    );
  }

  const initials = user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and account details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and Basic Info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{user.role}</Badge>
              {user.is_email_verified && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Email Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Company</p>
              <p className="text-sm text-gray-600">{user.company_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">2FA Status</p>
              <Badge variant={user.is_2fa_enabled ? "default" : "secondary"}>
                {user.is_2fa_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register('name')}
                disabled={!isEditing}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                disabled={!isEditing}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4">
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                variant="outline"
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  disabled={updateProfile.isPending || !hasChanges}
                >
                  {updateProfile.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateProfile.isPending}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </form>

        {/* Permissions */}
        {user.permissions && user.permissions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Your Permissions</h4>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
