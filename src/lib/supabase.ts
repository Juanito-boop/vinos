import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const service_roleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 10000),
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'wine-store-app'
    }
  }
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration error: Missing environment variables')
}

supabase.realtime.channel('global')
  .on('presence', { event: 'sync' }, () => {
          // Supabase realtime presence sync completed successfully
  })
  .subscribe(
    (status) => {
      if (status === 'SUBSCRIBED') {
        // Supabase realtime connected
      } else if (status === 'CLOSED') {
        // Supabase realtime disconnected
      }
    }
  )