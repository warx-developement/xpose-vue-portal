import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useProfile, useSetup2FA, useVerify2FASetup, useDisable2FA } from '@/hooks/useProfile';
import { Loader2, Shield, AlertTriangle, Copy, Check, Smartphone, Key } from 'lucide-react';
import { toast } from 'sonner';

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

type OtpFormData = z.infer<typeof otpSchema>;

export const TwoFactorAuth: React.FC = () => {
  const { data: user } = useProfile();
  const setup2FA = useSetup2FA();
  const verify2FA = useVerify2FASetup();
  const disable2FA = useDisable2FA();
  
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const is2FAEnabled = user?.is_2fa_enabled || false;

  const generateQRCode = async (secret: string, accountName: string, issuer: string) => {
    try {
      const otpAuthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`;
      const qrCodeDataURL = await QRCode.toDataURL(otpAuthUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataURL(qrCodeDataURL);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const handleSetup2FA = async () => {
    try {
      const response = await setup2FA.mutateAsync();
      if (response.data.success) {
        const { secret_key, account_name, issuer } = response.data.data;
        setSecretKey(secret_key);
        await generateQRCode(secret_key, account_name, issuer);
        setIsSettingUp(true);
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleVerify2FA = async (data: OtpFormData) => {
    try {
      await verify2FA.mutateAsync({ otp: data.otp });
      setIsSettingUp(false);
      setQrCodeDataURL('');
      setSecretKey('');
      reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDisable2FA = async (data: OtpFormData) => {
    try {
      await disable2FA.mutateAsync({ otp: data.otp });
      reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const copySecretKey = async () => {
    try {
      await navigator.clipboard.writeText(secretKey);
      setCopied(true);
      toast.success('Secret key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy secret key');
    }
  };

  const cancelSetup = () => {
    setIsSettingUp(false);
    setQrCodeDataURL('');
    setSecretKey('');
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with 2FA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium">2FA Status</p>
              <p className="text-sm text-gray-600">
                {is2FAEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
              </p>
            </div>
          </div>
          <Badge variant={is2FAEnabled ? "default" : "secondary"}>
            {is2FAEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>

        {!is2FAEnabled && !isSettingUp && (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication adds an extra layer of security to your account. 
                You'll need an authenticator app like Google Authenticator, Microsoft Authenticator, Authy, or 1Password.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleSetup2FA}
              disabled={setup2FA.isPending}
              className="w-full"
            >
              {setup2FA.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Enable Two-Factor Authentication
            </Button>
          </div>
        )}

        {isSettingUp && (
          <div className="space-y-6">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Using an authenticator app like Google Authenticator, Microsoft Authenticator, Authy or 1Password, 
                scan this QR code. It will generate a 6 digit code for you to enter below.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col items-center space-y-4">
              {qrCodeDataURL && (
                <div className="p-4 bg-white border rounded-lg">
                  <img src={qrCodeDataURL} alt="QR Code for 2FA setup" className="mx-auto" />
                </div>
              )}

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">Scan not working? Copy this code key and enter it manually in your authentication app.</p>
                {secretKey && (
                  <div className="flex items-center gap-2 justify-center">
                    <code className="px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                      {secretKey}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copySecretKey}
                      className="flex items-center gap-1"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(handleVerify2FA)} className="w-full max-w-sm space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Authenticator Code</Label>
                  <Input
                    id="otp"
                    {...register('otp')}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className={errors.otp ? 'border-red-500' : ''}
                  />
                  {errors.otp && (
                    <p className="text-sm text-red-500">{errors.otp.message}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={verify2FA.isPending}
                    className="flex-1"
                  >
                    {verify2FA.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Verify & Enable
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelSetup}
                    disabled={verify2FA.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> If you lose access to your authenticator app, you will need to contact an administrator to disable 2FA for you.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {is2FAEnabled && (
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is currently enabled for your account. 
                You can disable it by entering your current authenticator code below.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit(handleDisable2FA)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="disable_otp">Authenticator Code</Label>
                <Input
                  id="disable_otp"
                  {...register('otp')}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className={errors.otp ? 'border-red-500' : ''}
                />
                {errors.otp && (
                  <p className="text-sm text-red-500">{errors.otp.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="destructive"
                disabled={disable2FA.isPending}
                className="w-full"
              >
                {disable2FA.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Disable Two-Factor Authentication
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
