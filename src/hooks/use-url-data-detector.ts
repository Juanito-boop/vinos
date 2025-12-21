"use client"

import { useState, useEffect } from "react"
import { getURLState } from "@/lib/utils"

export function useURLDataDetector() {
	const [hasCartData, setHasCartData] = useState(false)
	const [hasFiltersData, setHasFiltersData] = useState(false)

	useEffect(() => {
		// Verificar si hay datos guardados en el estado unificado de la URL
		const state = getURLState()
		
		const cartData = state?.c
		const filtersData = state?.f

		setHasCartData(!!cartData && Array.isArray(cartData) && cartData.length > 0)
		setHasFiltersData(!!filtersData && typeof filtersData === 'object' && 
			((filtersData.va && filtersData.va.length > 0) || 
			(filtersData.b && filtersData.b.length > 0) || 
			(filtersData.pa && filtersData.pa.length > 0) || 
			(filtersData.t && filtersData.t.length > 0) ||
			filtersData.p !== undefined))
	}, [])

	return {
		hasCartData,
		hasFiltersData,
		hasAnyData: hasCartData || hasFiltersData
	}
} 