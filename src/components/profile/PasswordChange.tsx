import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useChangePassword } from '@/hooks/useProfile';
import { Loader2, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(25, 'Password must be less than 25 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).*$/, 
      'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const PasswordChange: React.FC = () => {
  const changePassword = useChangePassword();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword.mutateAsync(data);
      reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const newPassword = watch('new_password');
  const hasUpperCase = /[A-Z]/.test(newPassword || '');
  const hasLowerCase = /[a-z]/.test(newPassword || '');
  const hasDigit = /\d/.test(newPassword || '');
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(newPassword || '');
  const hasMinLength = (newPassword || '').length >= 8;
  const hasMaxLength = (newPassword || '').length <= 25;

  const passwordRequirements = [
    { label: 'At least 8 characters', met: hasMinLength },
    { label: 'Maximum 25 characters', met: hasMaxLength },
    { label: 'One lowercase letter', met: hasLowerCase },
    { label: 'One uppercase letter', met: hasUpperCase },
    { label: 'One digit', met: hasDigit },
    { label: 'One special character', met: hasSpecialChar },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Password changes will immediately invalidate all existing sessions. You'll need to log in again on all devices.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <div className="relative">
              <Input
                id="current_password"
                type={showPasswords.current ? 'text' : 'password'}
                {...register('current_password')}
                className={errors.current_password ? 'border-red-500' : ''}
                placeholder="Enter your current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.current_password && (
              <p className="text-sm text-red-500">{errors.current_password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showPasswords.new ? 'text' : 'password'}
                {...register('new_password')}
                className={errors.new_password ? 'border-red-500' : ''}
                placeholder="Enter your new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.new_password && (
              <p className="text-sm text-red-500">{errors.new_password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showPasswords.confirm ? 'text' : 'password'}
                {...register('confirm_password')}
                className={errors.confirm_password ? 'border-red-500' : ''}
                placeholder="Confirm your new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirm_password && (
              <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
            )}
          </div>

          {/* Password Requirements */}
          {newPassword && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Password Requirements</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {passwordRequirements.map((requirement, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-sm ${
                      requirement.met ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        requirement.met ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    {requirement.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={changePassword.isPending}
            className="w-full"
          >
            {changePassword.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Change Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
