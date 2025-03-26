"use client";

import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function UnauthorizedPage() {
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await supabase.auth.signOut();
        window.location.href = "/login";
      } catch (error) {
        console.error("Error signing out:", error);
        window.location.href = "/login";
      }
    };
    handleSignOut();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <Shield className="h-12 w-12 text-red-500" />
        </div>
        <div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don&apos;t have permission to access this application.
          </p>
        </div>
        <Button
          onClick={() => window.location.href = "/login"}
          className="mt-4"
        >
          Return to Login
        </Button>
      </div>
    </div>
  );
} 