
"use client";

import React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { ScrollFadeIn } from '@/components/shared/scroll-fade-in';
import { ShieldQuestion, KeyRound, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login if no user is found after loading
    // This might happen if the user directly navigates here without being logged in
    if (typeof window !== 'undefined') {
        router.push('/auth');
    }
    return null; 
  }
  
  const handlePlaceholderAction = (actionName: string) => {
    toast({
      title: "Feature Not Implemented",
      description: `${actionName} functionality will be available in a future update.`,
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Profile"
        description="Manage your account details and preferences."
      />
      <ScrollFadeIn>
        <Card className="shadow-lg max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>View and manage your Kamski account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={user.email || ''} readOnly disabled className="cursor-default" />
               <p className="text-xs text-muted-foreground">Your email address is used for login and cannot be changed here.</p>
            </div>

            <div className="space-y-2">
              <Label>Account Actions</Label>
              <div className="space-y-3">
                 <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handlePlaceholderAction("Change Password")}
                  >
                    <KeyRound className="mr-2 h-4 w-4" /> Change Password
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handlePlaceholderAction("Delete Account")}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                  </Button>
              </div>
            </div>
             <div className="space-y-2 pt-4 border-t">
                <Label>Security & Privacy</Label>
                <p className="text-sm text-muted-foreground">
                    Kamski is committed to protecting your data. For more information, please review our (upcoming) Privacy Policy and Terms of Service.
                </p>
                 <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary"
                    onClick={() => handlePlaceholderAction("View Privacy Policy")}
                  >
                    View Privacy Policy (Placeholder)
                  </Button>
            </div>
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground">User ID: {user.uid}</p>
          </CardFooter>
        </Card>
      </ScrollFadeIn>
    </div>
  );
}
