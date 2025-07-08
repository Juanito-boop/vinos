"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function DebugRealtimeStatus() {
  const [status, setStatus] = useState<string>('unknown')
  const [error, setError] = useState<string | null>(null)
  const [lastEvent, setLastEvent] = useState<any>(null)

  useEffect(() => {
    // Test channel para verificar conectividad
    const testChannel = supabase
      .channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wines' }, (payload) => {
        console.log('Change received: ', payload)
        setLastEvent(payload)
      })
      .subscribe((status) => {
        console.log('custom-all-channel status:', status)
        setStatus(status)
        
        if (status === 'CHANNEL_ERROR') {
          setError('Failed to connect to realtime')
        } else if (status === 'SUBSCRIBED') {
          setError(null)
        }
      })

    return () => {
      supabase.removeChannel(testChannel)
    }
  }, [])

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-white/95 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Realtime Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs">Status:</span>
          <Badge 
            variant={status === 'SUBSCRIBED' ? 'default' : status === 'CHANNEL_ERROR' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {status}
          </Badge>
        </div>
        
        {error && (
          <div className="text-xs text-red-600">
            Error: {error}
          </div>
        )}
        
        {lastEvent && (
          <div className="text-xs text-gray-600">
            Last event: {JSON.stringify(lastEvent, null, 2)}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}
          Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}
        </div>
      </CardContent>
    </Card>
  )
} 