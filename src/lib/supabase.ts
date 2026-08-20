import { createClient } from "@supabase/supabase-js"

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Auto-heal URL if user accidentally pastes the dashboard project page URL
if (supabaseUrl.includes("supabase.com/dashboard/project/")) {
  const parts = supabaseUrl.split("/project/")
  if (parts.length > 1) {
    const projectRef = parts[1].split("/")[0].trim()
    supabaseUrl = `https://${projectRef}.supabase.co`
  }
}

const isConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  !supabaseUrl.includes("your-project") && 
  !supabaseAnonKey.includes("your-anon-key") &&
  supabaseUrl.includes(".supabase.co")

if (!isConfigured) {
  console.warn(
    "[Supabase] Configuration is missing or using invalid/placeholder values. Database features will be bypassed. " +
    "Please update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
  )
}

// 1. Instantiate the public browser-safe client.
export const supabase = createClient(
  isConfigured ? supabaseUrl : "https://placeholder.supabase.co",
  isConfigured ? supabaseAnonKey : "placeholder"
)

export const isSupabaseConfigured = () => !!isConfigured

// 2. Server-side admin client using service_role key to bypass RLS for trusted operations (like migrations or auth overrides)
let supabaseAdminClient: any = null

export function getSupabaseAdmin() {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseAdmin() cannot be called on the client side.")
  }

  if (!supabaseAdminClient) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    const hasServiceKey = !!serviceKey && !serviceKey.includes("your-supabase-service-role-key")

    if (!hasServiceKey) {
      console.warn(
        "[Supabase Admin] Service role key is missing. Server database operations requiring RLS bypass will fail."
      )
    }

    supabaseAdminClient = createClient(
      isConfigured ? supabaseUrl : "https://placeholder.supabase.co",
      hasServiceKey ? serviceKey : "placeholder",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
  }

  return supabaseAdminClient
}
