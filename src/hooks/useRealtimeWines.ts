import { useEffect, useCallback, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import type { Wine } from "@/types"

export interface WineRealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  wine: Wine
}

export interface UseWineRealtimeReturn {
  wines: Wine[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useWineRealtime(
  onUpdate?: (event: WineRealtimeEvent) => void,
  onError?: (error: Error) => void
): UseWineRealtimeReturn {
  const [wines, setWines] = useState<Wine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const channelRef = useRef<any>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Función para cargar vinos iniciales
  const loadWines = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from("wines")
        .select(`
          *,
          wine_details (*)
        `)
        .order("nombre")

      if (fetchError) {
        throw fetchError
      }

      console.log('Raw wines data from Supabase:', data)
      
       const normalizedWines = (data || []).map((wine) => ({
        ...wine,
        wine_details: Array.isArray(wine.wine_details)
          ? wine.wine_details[0]
          : wine.wine_details
      }))

      setWines(normalizedWines)
    } catch (err) {
      const error = err as Error
      console.error('Error loading wines:', error)
      setError(error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  // Memoizar el callback para evitar re-suscripciones innecesarias
  const handleUpdate = useCallback((event: WineRealtimeEvent) => {
    try {
      setWines((prev) => {
        switch (event.type) {
          case 'INSERT':
            return [...prev, event.wine]
          case 'UPDATE':
            return prev.map((w) =>
              w.id_vino === event.wine.id_vino ? event.wine : w
            )
          case 'DELETE':
            return prev.filter((w) => w.id_vino !== event.wine.id_vino)
          default:
            return prev
        }
      })
      
      onUpdate?.(event)
    } catch (err) {
      const error = err as Error
      console.error('Error in wine realtime callback:', error)
      setError(error)
      onError?.(error)
    }
  }, [onUpdate, onError])

  // Función para configurar el canal con reintentos
  const setupChannel = useCallback(async (retryCount = 0) => {
    try {
      // Limpiar canal anterior si existe
      if (channelRef.current) {
        console.log('Removing previous channel')
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }

      console.log(`Setting up wine realtime channel (attempt ${retryCount + 1})`)
      
      channelRef.current = supabase
        .channel(`wines_changes_${Date.now()}`) // Nombre único para evitar conflictos
        .on(
          "postgres_changes",
          {
            event: "*", // insert | update | delete
            schema: "public",
            table: "wines",
          },
          (payload) => {
            console.log('Wine realtime event:', payload.eventType, payload)
            
            // Normalizar wine_details
            const normalizeWine = (wineData: any): Wine => {
              const normalizedWine = {
                ...wineData,
                wine_details: Array.isArray(wineData.wine_details)
                  ? wineData.wine_details[0] || {}
                  : (wineData.wine_details || {}),
              }
              console.log('Normalized wine in realtime:', normalizedWine)
              return normalizedWine
            }

            switch (payload.eventType) {
              case "INSERT":
                const newWine = normalizeWine(payload.new)
                handleUpdate({
                  type: 'INSERT',
                  wine: newWine
                })
                break

              case "UPDATE":
                const updatedWine = normalizeWine(payload.new)
                handleUpdate({
                  type: 'UPDATE',
                  wine: updatedWine
                })
                break

              case "DELETE":
                const deletedWine = normalizeWine(payload.old)
                handleUpdate({
                  type: 'DELETE',
                  wine: deletedWine
                })
                break

              default:
                console.warn('Unknown wine realtime event type:', (payload as any).eventType)
            }
          }
        )
        .subscribe((status) => {
          console.log('Wine realtime subscription status:', status)
          
          if (status === 'CHANNEL_ERROR') {
            console.error('Wine realtime channel error - attempting retry')
            const error = new Error(`Failed to subscribe to wine changes (attempt ${retryCount + 1})`)
            setError(error)
            onError?.(error)
            
            // Reintentar después de 5 segundos (máximo 3 intentos)
            if (retryCount < 2) {
              retryTimeoutRef.current = setTimeout(() => {
                setupChannel(retryCount + 1)
              }, 5000)
            }
          } else if (status === 'SUBSCRIBED') {
            console.log('Wine realtime channel subscribed successfully')
            setError(null) // Limpiar errores anteriores si la suscripción es exitosa
          }
        })

        console.log(channelRef.current)

    } catch (err) {
      const error = err as Error
      console.error('Error setting up wine realtime channel:', error)
      setError(error)
      onError?.(error)
      
      // Reintentar en caso de error de configuración
      if (retryCount < 2) {
        retryTimeoutRef.current = setTimeout(() => {
          setupChannel(retryCount + 1)
        }, 5000)
      }
    }
  }, [handleUpdate, onError])

  useEffect(() => {
    // Cargar datos iniciales y configurar realtime
    loadWines().then(() => {
      setupChannel()
    })

    return () => {
      // Limpiar timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      
      // Limpiar canal
      if (channelRef.current) {
        console.log('Cleaning up wine realtime channel')
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [loadWines, setupChannel])

  return {
    wines,
    isLoading,
    error,
    refetch: loadWines
  }
}
