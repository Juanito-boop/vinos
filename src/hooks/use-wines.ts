"use client";

import { useWineRealtimeContext } from "@/providers/wine-realtime-provider";
import { useState, useEffect } from "react";
import { WineService } from "@/lib/services/wine-service";
import type { Wine } from "@/types";

export function useWines() {
  const {
    wines: realtimeWines,
    isLoading: realtimeLoading,
    error: realtimeError,
    refetch: refetchRealtime,
  } = useWineRealtimeContext();

  const [fallbackWines, setFallbackWines] = useState<Wine[]>([]);
  const [isLoadingFallback, setIsLoadingFallback] = useState(false);
  const [fallbackError, setFallbackError] = useState<Error | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const shouldUseFallback =
    (realtimeError && realtimeWines.length === 0) || isUsingFallback;

  // Cargar datos de fallback si es necesario
  useEffect(() => {
    let isMounted = true;

    if (shouldUseFallback && fallbackWines.length === 0 && !isLoadingFallback) {
      setIsLoadingFallback(true);
      setFallbackError(null);

      WineService.getAllWines()
        .then((wines) => {
          if (isMounted) {
            setFallbackWines(wines);
            setIsUsingFallback(true);
          }
        })
        .catch((error) => {
          if (!isMounted) return;
          console.error("useWines: Error loading fallback wines:", error);

          let errorMessage = "Error loading fallback wines";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === "string") {
            errorMessage = error;
          } else if (error && typeof error === "object") {
            errorMessage = JSON.stringify(error);
          }

          setFallbackError(new Error(errorMessage));
        })
        .finally(() => {
          if (isMounted) setIsLoadingFallback(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [shouldUseFallback, fallbackWines, isLoadingFallback]);

  // Si vuelve realtime, restaurar el estado original
  useEffect(() => {
    if (realtimeWines.length > 0 && !realtimeError && isUsingFallback) {
      setIsUsingFallback(false);
      setFallbackWines([]);
      setFallbackError(null);
    }
  }, [realtimeWines, realtimeError, isUsingFallback]);

  const wines = shouldUseFallback ? fallbackWines : realtimeWines;
  const isLoading = shouldUseFallback ? isLoadingFallback : realtimeLoading;
  const error = shouldUseFallback ? fallbackError : realtimeError;

  const refetchWines = async () => {
    try {
      // Intentamos refetch de realtime
      await refetchRealtime();
    } catch (error) {
      console.warn("useWines: Realtime refetch failed, trying fallback:", error);

      // Si falla, intentamos el fallback
      try {
        const wines = await WineService.getAllWines();
        setFallbackWines(wines);
        setFallbackError(null);
        setIsUsingFallback(true);
      } catch (fallbackError) {
        console.error("useWines: Both realtime and fallback failed:", fallbackError);

        let errorMessage = "Both realtime and fallback failed";
        if (fallbackError instanceof Error) {
          errorMessage = fallbackError.message;
        } else if (typeof fallbackError === "string") {
          errorMessage = fallbackError;
        } else if (fallbackError && typeof fallbackError === "object") {
          errorMessage = JSON.stringify(fallbackError);
        }

        setFallbackError(new Error(errorMessage));
      }
    }
  };

  return {
    wines,
    isLoading,
    error,
    refetch: refetchWines,
    realtimeError,
    fallbackError,
    isUsingFallback,
    realtimeStatus: realtimeError
      ? "error"
      : realtimeLoading
      ? "loading"
      : "connected",

    // Funciones auxiliares
    getWineById: (id: string) => wines.find((w) => w.id_vino === id),
    getWinesByCategory: (category: string) =>
      wines.filter((w) => w.color_vino === category),
    getWinesByBodega: (bodega: string) =>
      wines.filter((w) => w.wine_details.bodega === bodega),
    getWinesByPais: (pais: string) =>
      wines.filter((w) => w.pais_importacion === pais),
    getWinesByVariedad: (variedad: string) =>
      wines.filter((w) => w.variedades.includes(variedad)),
    getWinesByPriceRange: (min: number, max: number) =>
      wines.filter((w) => w.precio >= min && w.precio <= max),
    getWinesInStock: () => wines.filter((w) => w.stock > 0),
    getWinesOutOfStock: () => wines.filter((w) => w.stock === 0),
  };
}
