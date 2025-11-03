import { useEffect, useCallback, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import type { Wine } from "@/types"

export interface WineRealtimeEvent {
  type: "INSERT" | "UPDATE" | "DELETE"
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
  const winesRef = useRef<Wine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const channelRef = useRef<any>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const isSubscribedRef = useRef(false)

  // --- carga inicial ---
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
        .order("bodega", { referencedTable: "wine_details", ascending: true })
        .order("nombre", { ascending: true })
        .order("variedades", { ascending: true })
        .order("capacidad", { ascending: false })

      if (fetchError) throw fetchError

      const normalized = (data || []).map((wine) => ({
        ...wine,
        wine_details: Array.isArray(wine.wine_details)
          ? wine.wine_details[0]
          : wine.wine_details,
      }))

      setWines(normalized)
      winesRef.current = normalized
    } catch (err: any) {
      const message = err?.message || JSON.stringify(err)
      const customError = new Error(message)
      setError(customError)
      onError?.(customError)
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  // --- manejo de eventos ---
  const handleUpdate = useCallback(
    (event: WineRealtimeEvent) => {
      try {
        setWines((prev) => {
          let next = prev
          switch (event.type) {
            case "INSERT":
              // evita duplicados
              if (!prev.some((w) => w.id_vino === event.wine.id_vino)) {
                next = [...prev, event.wine]
              }
              break
            case "UPDATE":
              next = prev.map((w) =>
                w.id_vino === event.wine.id_vino ? event.wine : w
              )
              break
            case "DELETE":
              next = prev.filter((w) => w.id_vino !== event.wine.id_vino)
              break
          }
          winesRef.current = next
          return next
        })
        onUpdate?.(event)
      } catch (err: any) {
        const e = new Error(err.message || "Error in realtime callback")
        setError(e)
        onError?.(e)
      }
    },
    [onUpdate, onError]
  )

  // --- configurar canal realtime ---
  const setupChannel = useCallback(
    async (retryCount = 0) => {
      try {
        // limpiar canal anterior
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current)
          channelRef.current = null
          isSubscribedRef.current = false
        }

        channelRef.current = supabase
          .channel("wines_changes") // nombre fijo
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "wines" },
            async (payload) => {
              try {
                const normalizeWine = (wineData: any): Wine => ({
                  ...wineData,
                  wine_details: Array.isArray(wineData.wine_details)
                    ? wineData.wine_details[0] || {}
                    : wineData.wine_details || {},
                })

                switch (payload.eventType) {
                  case "INSERT":
                    handleUpdate({
                      type: "INSERT",
                      wine: normalizeWine(payload.new),
                    })
                    break

                  case "UPDATE": {
                    const newData = payload.new
                    // solo consulta si no hay wine_details
                    if (newData.wine_details) {
                      handleUpdate({
                        type: "UPDATE",
                        wine: normalizeWine(newData),
                      })
                    } else {
                      const { data: updatedWineData, error: fetchError } =
                        await supabase
                          .from("wines")
                          .select(`
                            *,
                            wine_details (*)
                          `)
                          .eq("id_vino", newData.id_vino)
                          .single()

                      if (fetchError || !updatedWineData) {
                        handleUpdate({
                          type: "UPDATE",
                          wine: normalizeWine(newData),
                        })
                      } else {
                        handleUpdate({
                          type: "UPDATE",
                          wine: normalizeWine(updatedWineData),
                        })
                      }
                    }
                    break
                  }

                  case "DELETE":
                    handleUpdate({
                      type: "DELETE",
                      wine: normalizeWine(payload.old),
                    })
                    break
                }
              } catch (err) {
                console.warn("Error processing realtime event:", err)
              }
            }
          )
          .subscribe((status) => {
            if (status === "CHANNEL_ERROR") {
              const e = new Error(
                `Failed to subscribe to wine changes (attempt ${retryCount + 1})`
              )
              setError(e)
              onError?.(e)

              if (retryCount < 2) {
                retryTimeoutRef.current = setTimeout(
                  () => setupChannel(retryCount + 1),
                  5000
                )
              }
            } else if (status === "SUBSCRIBED") {
              setError(null)
              isSubscribedRef.current = true
            } else if (status === "CLOSED") {
              console.warn("Wine realtime channel closed — retaining cache")
              isSubscribedRef.current = false
            }
          })
      } catch (err: any) {
        const e = new Error(err.message || "Error setting up realtime channel")
        setError(e)
        onError?.(e)

        if (retryCount < 2) {
          retryTimeoutRef.current = setTimeout(
            () => setupChannel(retryCount + 1),
            5000
          )
        }
      }
    },
    [handleUpdate, onError]
  )

  // --- montaje ---
  useEffect(() => {
    // Ejecutar carga inicial y realtime en paralelo
    loadWines()
    setupChannel()

    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
      if (channelRef.current) {
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
    refetch: loadWines,
  }
}
