"use client"

import { AuthForm } from "@/components/ui/auth-form"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error("Error signing in with Google:", error)
        return
      }

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Error signing in with Google:", error)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-[350px] p-4 space-y-6">
        <AuthForm 
          onGoogleSignIn={handleGoogleSignIn}
        />
      </div>
    </div>
  )
} 