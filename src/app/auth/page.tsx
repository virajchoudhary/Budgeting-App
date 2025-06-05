
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/shared/page-header';

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isLoginView && password !== confirmPassword) {
      toast({ variant: "destructive", title: "Signup Failed", description: "Passwords do not match." });
      setIsLoading(false);
      return;
    }

    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Logged In", description: "Welcome back!" });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Account Created", description: "Welcome to Kamski! You are now logged in." });
      }
      router.push('/'); // Redirect to dashboard
    } catch (error: any) {
      console.error(`${isLoginView ? 'Login' : 'Signup'} error:`, error);
      toast({ variant: "destructive", title: `${isLoginView ? 'Login' : 'Signup'} Failed`, description: error.message || "Please check your credentials and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12">
      <PageHeader 
        title={isLoginView ? "Login to Kamski" : "Create your Kamski Account"}
        description={isLoginView ? "Access your financial dashboard." : "Join us and manage your finances effectively."}
      />
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground tracking-tight">{isLoginView ? 'Welcome Back' : 'Get Started'}</CardTitle>
          <CardDescription>
            {isLoginView ? 'Enter your credentials to continue.' : 'Create an account to begin your financial journey.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuthAction}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={isLoginView ? "••••••••" : "•••••••• (min. 6 characters)"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base"
              />
            </div>
            {!isLoginView && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="text-base"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isLoginView ? 'Log In' : 'Sign Up')}
            </Button>
            <Button type="button" variant="link" onClick={toggleView} className="font-medium text-primary hover:underline">
              {isLoginView ? 'Need an account? Sign up' : 'Already have an account? Log in'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

    
