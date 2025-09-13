import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Shield } from 'lucide-react';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { PasswordChange } from '@/components/profile/PasswordChange';
import { TwoFactorAuth } from '@/components/profile/TwoFactorAuth';

const Profile: React.FC = () => {
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and security preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile Information
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Password & Security
          </TabsTrigger>
          <TabsTrigger value="2fa" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Two-Factor Authentication
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileInfo />
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <PasswordChange />
        </TabsContent>

        <TabsContent value="2fa" className="space-y-6">
          <TwoFactorAuth />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
