"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import type { Wine, FilterState } from "@/types"
import { updateURLWithData, getDataFromURL } from "@/lib/utils"

export function useFilters(wines: Wine[]) {
  const [filters, setFilters] = useState<FilterState>({
    selectedVariedades: [],
    selectedBodegas: [],
    selectedPaises: [],
    selectedColores: [],
    priceRange: {
      min: 0,
      max: 0,
    },
  })
  const isInitialized = useRef(false)

  // Cargar filtros desde URL al inicializar
  useEffect(() => {
    const savedFilters = getDataFromURL('filters')
    if (savedFilters && typeof savedFilters === 'object') {
      // Asegurar que el rango de precio esté presente
      const filtersWithPrice = {
        ...savedFilters,
        priceRange: savedFilters.priceRange || { min: 0, max: 0 }
      }
      setFilters(filtersWithPrice)
    }
    isInitialized.current = true
  }, [])

  // Actualizar URL cuando cambien los filtros (después del renderizado)
  useEffect(() => {
    if (isInitialized.current) {
      updateURLWithData(filters, 'filters')
    }
  }, [filters])

  // Calcular rangos de precio
  const priceRange = useMemo(() => {
    if (wines.length === 0) return { min: 0, max: 0 }
    
    const prices = wines.map(wine => wine.precio)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    
    return { min, max }
  }, [wines])

  // Inicializar rango de precio cuando se cargan los vinos
  useEffect(() => {
    if (priceRange.min > 0 && priceRange.max > 0 && filters.priceRange.min === 0 && filters.priceRange.max === 0) {
      setFilters(prev => ({
        ...prev,
        priceRange: { min: priceRange.min, max: priceRange.max }
      }))
    }
  }, [priceRange, filters.priceRange])

  const variedades = useMemo(() => {
    const allVariedades = wines.flatMap((wine) => wine.variedades)
    return [...new Set(allVariedades)]
  }, [wines])

  const bodegas = useMemo(() => [...new Set(wines.map((wine) => wine.wine_details.bodega))], [wines])
  const paises = useMemo(() => [...new Set(wines.map((wine) => wine.pais_importacion))], [wines])
  const colores = useMemo(() => [...new Set(wines.map((wine) => wine.color_vino))], [wines])

  const filteredWines = useMemo(() => {
    return wines.filter((wine) => {
      const varietalMatch =
        filters.selectedVariedades.length === 0 ||
        wine.variedades.some((variedad) => filters.selectedVariedades.includes(variedad))
      const bodegaMatch = filters.selectedBodegas.length === 0 || filters.selectedBodegas.includes(wine.wine_details.bodega)
      const paisMatch = filters.selectedPaises.length === 0 || filters.selectedPaises.includes(wine.pais_importacion)
      const colorMatch = filters.selectedColores.length === 0 || filters.selectedColores.includes(wine.color_vino)
      const priceMatch = wine.precio >= filters.priceRange.min && wine.precio <= filters.priceRange.max

      return varietalMatch && bodegaMatch && paisMatch && colorMatch && priceMatch
    })
  }, [wines, filters])

  const getFilteredCountsForCategory = useCallback(
    (category: "variedades" | "bodegas" | "paises" | "colores") => {
      const tempFilters = { ...filters }

      // Remover el filtro de la categoría actual para calcular contadores
      switch (category) {
        case "variedades":
          tempFilters.selectedVariedades = []
          break
        case "bodegas":
          tempFilters.selectedBodegas = []
          break
        case "paises":
          tempFilters.selectedPaises = []
          break
        case "colores":
          tempFilters.selectedColores = []
          break
      }

      // Filtrar vinos con los otros filtros aplicados
      const tempFilteredWines = wines.filter((wine) => {
        const varietalMatch =
          tempFilters.selectedVariedades.length === 0 ||
          wine.variedades.some((variedad) => tempFilters.selectedVariedades.includes(variedad))
        const bodegaMatch =
          tempFilters.selectedBodegas.length === 0 || tempFilters.selectedBodegas.includes(wine.wine_details.bodega)
        const paisMatch =
          tempFilters.selectedPaises.length === 0 || tempFilters.selectedPaises.includes(wine.pais_importacion)
        const colorMatch =
          tempFilters.selectedColores.length === 0 || tempFilters.selectedColores.includes(wine.color_vino)
        const priceMatch = wine.precio >= tempFilters.priceRange.min && wine.precio <= tempFilters.priceRange.max

        return varietalMatch && bodegaMatch && paisMatch && colorMatch && priceMatch
      })

      return tempFilteredWines
    },
    [wines, filters],
  )

  const varietalCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const relevantWines = getFilteredCountsForCategory("variedades")
    relevantWines.forEach((wine) => {
      wine.variedades.forEach((variedad) => {
        counts[variedad] = (counts[variedad] || 0) + 1
      })
    })
    return counts
  }, [getFilteredCountsForCategory])

  const bodegaCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const relevantWines = getFilteredCountsForCategory("bodegas")
    relevantWines.forEach((wine) => {
      counts[wine.wine_details.bodega] = (counts[wine.wine_details.bodega] || 0) + 1
    })
    return counts
  }, [getFilteredCountsForCategory])

  const paisCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const relevantWines = getFilteredCountsForCategory("paises")
    relevantWines.forEach((wine) => {
      counts[wine.pais_importacion] = (counts[wine.pais_importacion] || 0) + 1
    })
    return counts
  }, [getFilteredCountsForCategory])

  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const relevantWines = getFilteredCountsForCategory("colores")
    relevantWines.forEach((wine) => {
      counts[wine.color_vino] = (counts[wine.color_vino] || 0) + 1
    })
    return counts
  }, [getFilteredCountsForCategory])

  const toggleVariedad = (variedad: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedVariedades: prev.selectedVariedades.includes(variedad)
        ? prev.selectedVariedades.filter((v) => v !== variedad)
        : [...prev.selectedVariedades, variedad],
    }))
  }

  const toggleBodega = (bodega: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedBodegas: prev.selectedBodegas.includes(bodega)
        ? prev.selectedBodegas.filter((b) => b !== bodega)
        : [...prev.selectedBodegas, bodega],
    }))
  }

  const togglePais = (pais: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedPaises: prev.selectedPaises.includes(pais)
        ? prev.selectedPaises.filter((p) => p !== pais)
        : [...prev.selectedPaises, pais],
    }))
  }

  const toggleColor = (color: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedColores: prev.selectedColores.includes(color)
        ? prev.selectedColores.filter((c) => c !== color)
        : [...prev.selectedColores, color],
    }))
  }

  const updatePriceRange = (min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: { min, max }
    }))
  }

  const clearFilters = () => {
    setFilters({
      selectedVariedades: [],
      selectedBodegas: [],
      selectedPaises: [],
      selectedColores: [],
      priceRange: { min: priceRange.min, max: priceRange.max }
    })
  }

  const hasActiveFilters =
    filters.selectedVariedades.length > 0 ||
    filters.selectedBodegas.length > 0 ||
    filters.selectedPaises.length > 0 ||
    filters.selectedColores.length > 0 ||
    filters.priceRange.min !== priceRange.min ||
    filters.priceRange.max !== priceRange.max

  return {
    filters,
    filteredWines,
    variedades,
    bodegas,
    paises,
    colores,
    priceRange,
    toggleVariedad,
    toggleBodega,
    togglePais,
    toggleColor,
    updatePriceRange,
    clearFilters,
    hasActiveFilters,
    varietalCounts,
    bodegaCounts,
    paisCounts,
    colorCounts,
  }
}
