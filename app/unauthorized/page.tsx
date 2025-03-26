"use client";

import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { AUTH_MESSAGES } from "../lib/auth-config";
import { useState } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function UnauthorizedPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      // Force a hard reload to the login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during sign out:', error);
      // If all else fails, force reload to login
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="max-w-md w-full p-8 shadow-lg border-2 border-destructive/20">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="rounded-full bg-destructive/10 p-4 ring-4 ring-destructive/20">
            <Shield className="w-10 h-10 text-destructive" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-destructive">
              Access Denied
            </h1>
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground">
                You don't have permission to access this page.
              </p>
              <p className="text-sm text-muted-foreground/80">
                {AUTH_MESSAGES.UNAUTHORIZED_EMAIL}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full pt-4">
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full h-11 text-base"
            >
              {isSigningOut ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Signing out...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Return to Login
                </span>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = 'mailto:support@idealupholstery.com'}
              className="w-full h-11 text-base"
              disabled={isSigningOut}
            >
              Contact Support
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 