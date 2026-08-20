"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useSummarizationStore } from "@/store/summarization"

export const AuthInitializer = () => {
  const { setUser, fetchHistory, claimGuestHistory, initSession } = useSummarizationStore()

  useEffect(() => {
    // 1. Initialize anonymous guest session first
    initSession()

    // 2. Load current session details
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user, session.access_token)
        claimGuestHistory().then(() => {
          fetchHistory()
        })
      } else {
        setUser(null, null)
        fetchHistory()
      }
    })

    // 3. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user, session.access_token)
        
        // Claim guest summaries when signing in
        if (event === "SIGNED_IN") {
          await claimGuestHistory()
        }
        fetchHistory()
      } else {
        setUser(null, null)
        fetchHistory()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, fetchHistory, claimGuestHistory, initSession])

  return null
}
