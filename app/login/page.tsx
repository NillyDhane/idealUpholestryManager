"use client"

import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push("/dashboard")
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleGoogleLogin = async () => {
    console.log('\n=== Google Login Attempt ===')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        console.error('Login Page - OAuth error:', error)
        throw error
      }
      console.log('Login Page - OAuth redirect initiated')
    } catch (error) {
      console.error('Login Page - Login error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="max-w-md w-full p-8 shadow-lg">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <Button 
            onClick={handleGoogleLogin}
            className="w-full h-11 text-base"
          >
            Sign in with Google
          </Button>
        </div>
      </Card>
    </div>
  )
} 