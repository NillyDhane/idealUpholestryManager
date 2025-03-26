'use server'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Clear all Supabase-related cookies
    const cookieNames = cookieStore.getAll().map(cookie => cookie.name)
    cookieNames.forEach(name => {
      if (name.startsWith('sb-')) {
        cookieStore.delete(name)
      }
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error signing out:', error)
    return { success: false, error }
  }
} 