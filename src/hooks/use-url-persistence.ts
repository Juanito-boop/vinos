"use client"

import { useCallback } from "react"
import { clearURLParams } from "@/lib/utils"

export function useURLPersistence() {
  const clearAllData = useCallback(() => {
    requestAnimationFrame(() => {
      clearURLParams('cart', 'filters')
    })
  }, [])

  const clearCartData = useCallback(() => {
    requestAnimationFrame(() => {
      clearURLParams('cart')
    })
  }, [])

  const clearFiltersData = useCallback(() => {
    requestAnimationFrame(() => {
      clearURLParams('filters')
    })
  }, [])

  return {
    clearAllData,
    clearCartData,
    clearFiltersData,
  }
} 