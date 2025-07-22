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
  const isSubscribedRef = useRef(false)

  // Función para cargar vinos iniciales
  const loadWines = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Loading wines from Supabase...
      
      const { data, error: fetchError } = await supabase
        .from("wines")
        .select(`
          *,
          wine_details (*)
        `)
        .order("bodega", { referencedTable: 'wine_details', ascending: true })
        .order("nombre", { ascending: true })
        .order("variedades", { ascending: true })
        .order("capacidad", { ascending: false })

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError)
        throw new Error(`Error fetching wines: ${fetchError.message || 'Unknown error'}`)
      }

              // Raw wines data from Supabase
      
      if (!data) {
        console.warn('No data returned from Supabase')
        setWines([])
        return
      }
      
      const normalizedWines = data.map((wine) => ({
        ...wine,
        wine_details: Array.isArray(wine.wine_details)
          ? wine.wine_details[0]
          : wine.wine_details
      }))

              // Normalized wines
      setWines(normalizedWines)
    } catch (err) {
      console.error('Error loading wines:', err)
      
      // Crear un error más informativo
      let errorMessage = 'Error loading wines'
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      } else if (err && typeof err === 'object') {
        errorMessage = JSON.stringify(err)
      }
      
      const error = new Error(errorMessage)
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
        // Removing previous channel
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        isSubscribedRef.current = false
      }

              // Setting up wine realtime channel
      
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
            try {
              // Wine realtime event
              
              // Normalizar wine_details
              const normalizeWine = (wineData: any): Wine => {
                const normalizedWine = {
                  ...wineData,
                  wine_details: Array.isArray(wineData.wine_details)
                    ? wineData.wine_details[0] || {}
                    : (wineData.wine_details || {}),
                }
                // Normalized wine in realtime
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
                  // Para actualizaciones, necesitamos obtener los datos completos incluyendo wine_details
                  const fetchUpdatedWine = async () => {
                    try {
                      const { data: updatedWineData, error: fetchError } = await supabase
                        .from("wines")
                        .select(`
                          *,
                          wine_details (*)
                        `)
                        .eq('id_vino', payload.new.id_vino)
                        .single()

                      if (fetchError) {
                        console.error('Error fetching updated wine:', fetchError)
                        // Fallback: usar los datos del payload
                        const updatedWine = normalizeWine(payload.new)
                        handleUpdate({
                          type: 'UPDATE',
                          wine: updatedWine
                        })
                      } else {
                        const normalizedUpdatedWine = {
                          ...updatedWineData,
                          wine_details: Array.isArray(updatedWineData.wine_details)
                            ? updatedWineData.wine_details[0]
                            : updatedWineData.wine_details
                        }
                        handleUpdate({
                          type: 'UPDATE',
                          wine: normalizedUpdatedWine
                        })
                      }
                    } catch (err) {
                      console.error('Error in fetchUpdatedWine:', err)
                      // Fallback: usar los datos del payload
                      const updatedWine = normalizeWine(payload.new)
                      handleUpdate({
                        type: 'UPDATE',
                        wine: updatedWine
                      })
                    }
                  }
                  
                  fetchUpdatedWine()
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
            } catch (err) {
              // Capturar errores en el callback del canal sin propagarlos
              console.warn('Error processing wine realtime event:', err)
            }
          }
        )
        .subscribe((status) => {
          // Wine realtime subscription status
          
          if (status === 'CHANNEL_ERROR') {
            console.warn('Wine realtime channel error - attempting retry')
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
            // Wine realtime channel subscribed successfully
            setError(null) // Limpiar errores anteriores si la suscripción es exitosa
            isSubscribedRef.current = true
          } else if (status === 'CLOSED') {
            // Wine realtime channel closed
            isSubscribedRef.current = false
          }
        })

        // Channel reference

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
        // Cleaning up wine realtime channel
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        isSubscribedRef.current = false
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
