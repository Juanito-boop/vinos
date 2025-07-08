"use client"

import { useState, useEffect } from "react"
import { getDataFromURL } from "@/lib/utils"

export function useURLDataDetector() {
  const [hasCartData, setHasCartData] = useState(false)
  const [hasFiltersData, setHasFiltersData] = useState(false)

  useEffect(() => {
    // Verificar si hay datos guardados en la URL
    const cartData = getDataFromURL('cart')
    const filtersData = getDataFromURL('filters')

    setHasCartData(!!cartData && Array.isArray(cartData) && cartData.length > 0)
    setHasFiltersData(!!filtersData && typeof filtersData === 'object' && 
      (filtersData.selectedVariedades?.length > 0 || 
       filtersData.selectedBodegas?.length > 0 || 
       filtersData.selectedPaises?.length > 0 || 
       filtersData.selectedColores?.length > 0))
  }, [])

  return {
    hasCartData,
    hasFiltersData,
    hasAnyData: hasCartData || hasFiltersData
  }
} 