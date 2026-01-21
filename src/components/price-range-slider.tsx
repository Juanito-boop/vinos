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
		<Card className="border-0 shadow-none bg-transparent">
			<CardHeader className="p-0 pb-0">
				<CardTitle className="text-xs font-black uppercase tracking-widest text-primary/60">Rango de Precio</CardTitle>
			</CardHeader>
			<CardContent className="space-y-10 p-0 mt-4">
				<div className="relative px-2">
					<DualRangeSlider
						value={[localMin, localMax]}
						onValueChange={handleSliderChange}
						min={minPrice}
						max={maxPrice}
						step={10000}
						className="w-full"
						label={(value) => formatPrice(value || 0)}
						labelPosition="top"
					/>
				</div>

				{/* Valores actuales en un diseño más premium */}
				<div className="flex flex-col items-center gap-1 py-3 px-4 rounded-2xl bg-primary/[0.03] border border-primary/5">
					<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Selección actual</span>
					<div className="flex items-center gap-3">
						<span className="text-sm font-black text-primary">{formatPrice(localMin)}</span>
						<div className="h-px w-4 bg-primary/20" />
						<span className="text-sm font-black text-primary">{formatPrice(localMax)}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}