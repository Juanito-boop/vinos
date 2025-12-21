"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { DualRangeSlider } from "./ui/dual-range-slider"
import { formatPrice } from "@/utils/price"

interface PriceRangeSliderProps {
  minPrice: number
  maxPrice: number
  currentMin: number
  currentMax: number
  onRangeChange: (min: number, max: number) => void
}

export function PriceRangeSlider({
	minPrice,
	maxPrice,
	currentMin,
	currentMax,
	onRangeChange,
}: PriceRangeSliderProps) {
	const [localMin, setLocalMin] = useState(currentMin)
	const [localMax, setLocalMax] = useState(currentMax)

	// Actualizar valores locales cuando cambien los props
	useEffect(() => {
		setLocalMin(currentMin)
		setLocalMax(currentMax)
	}, [currentMin, currentMax])

	const handleSliderChange = (values: number[]) => {
		const [min, max] = values
		setLocalMin(min)
		setLocalMax(max)
		onRangeChange(min, max)
	}

	return (
		<Card className="border-0">
			<CardHeader className="p-0 pb-3">
				<CardTitle className="text-sm font-medium">Rango de Precio</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				{/* Slider de rango usando DualRangeSlider */}
				<div className="relative pt-6 px-4">
					<DualRangeSlider
						value={[localMin, localMax]}
						onValueChange={handleSliderChange}
						min={minPrice}
						max={maxPrice}
						step={10000}
						className="w-full"
						label={(value) => (
							<span className="text-xs text-muted-foreground bg-background px-1 rounded">
								{formatPrice(value || 0)}
							</span>
						)}
						labelPosition="top"
					/>
          
					{/* Etiquetas de precio mínimo y máximo */}
					<div className="flex justify-between mt-2 text-xs text-muted-foreground">
						<span>{formatPrice(minPrice)}</span>
						<span>{formatPrice(maxPrice)}</span>
					</div>
				</div>

				{/* Valores actuales */}
				<div className="text-center text-sm text-muted-foreground bg-gray-50 py-2 rounded">
					{formatPrice(localMin)} - {formatPrice(localMax)}
				</div>
			</CardContent>
		</Card>
	)
}