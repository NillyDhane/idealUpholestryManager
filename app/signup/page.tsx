"use client"

import { AuthForm } from "@/components/ui/auth-form"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function SignUpPage() {
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Error signing in with Google:", error)
    }
  }

  const handleSignUp = () => {
    router.push("/login")
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <AuthForm 
          onGoogleSignIn={handleGoogleSignIn}
          onSignUp={handleSignUp}
          mode="signup"
        />
      </div>
    </div>
  )
} 