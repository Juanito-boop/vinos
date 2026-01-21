"use client"

import { useState } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"
import { getCountryFlag } from "@/utils/price"
import { PriceRangeSlider } from "./price-range-slider"

/* =======================
	 Types
======================= */

interface FiltersSidebarProps {
	variedades: string[]
	bodegas: string[]
	paises: string[]
	colores: string[]
	selectedVariedades: string[]
	selectedBodegas: string[]
	selectedPaises: string[]
	selectedColores: string[]
	priceRange: { min: number; max: number }
	currentPriceRange: { min: number; max: number }
	onToggleVariedad: (variedad: string) => void
	onToggleBodega: (bodega: string) => void
	onTogglePais: (pais: string) => void
	onToggleColor: (color: string) => void
	onUpdatePriceRange: (min: number, max: number) => void
	onClearFilters: () => void
	hasActiveFilters: boolean
	varietalCounts: Record<string, number>
	bodegaCounts: Record<string, number>
	paisCounts: Record<string, number>
	colorCounts: Record<string, number>
	isOpen?: boolean
	setIsOpen?: (open: boolean) => void
}

interface FilterItemProps {
	id: string
	label: string
	checked: boolean
	count: number
	onToggle: () => void
	icon?: React.ReactNode
}

/* =======================
	 UI Helpers
======================= */

function FilterItem({
	id,
	label,
	checked,
	count,
	onToggle,
	icon,
}: FilterItemProps) {
	return (
		<div className="flex items-center justify-between py-1">
			<div className="flex items-center space-x-2">
				<Checkbox id={id} checked={checked} onCheckedChange={onToggle} />
				<Label htmlFor={id} className="flex items-center gap-2 text-sm">
					<span className="text-base">{icon}</span>
					<span>{label}</span>
				</Label>
			</div>
			<span className="text-[10px] font-bold text-gray-400">{count}</span>
		</div>
	)
}

function FilterSection({
	value,
	title,
	items,
}: {
	value: string
	title: string
	items: FilterItemProps[]
}) {
	return (
		<AccordionItem value={value}>
			<AccordionTrigger className="text-base font-medium">
				{title}
			</AccordionTrigger>
			<AccordionContent>
				<div className="space-y-2 max-h-52 overflow-y-auto pr-2">
					{items.map((item) => (
						<FilterItem key={item.id} {...item} />
					))}
				</div>
			</AccordionContent>
		</AccordionItem>
	)
}

function getColorIcon(color: string) {
	return (
		<div
			className={`w-3 h-3 rounded-full ${color === "Tinto"
				? "bg-red-600"
				: color === "Blanco"
					? "bg-yellow-200 border border-yellow-400"
					: "bg-pink-300"
			}`}
		/>
	)
}

/* =======================
	 Component
======================= */

export function FiltersSidebar(props: FiltersSidebarProps) {
	const { variedades, bodegas, paises, colores, selectedVariedades, selectedBodegas, selectedPaises, selectedColores, priceRange, currentPriceRange, onToggleVariedad, onToggleBodega, onTogglePais, onToggleColor, onUpdatePriceRange, onClearFilters, hasActiveFilters, varietalCounts, bodegaCounts, paisCounts, colorCounts, isOpen: externalIsOpen, setIsOpen: externalSetIsOpen, } = props

	const [internalIsOpen, setInternalIsOpen] = useState(false)
	const [showAdvanced, setShowAdvanced] = useState(false)

	const isOpen = externalIsOpen ?? internalIsOpen
	const setIsOpen = externalSetIsOpen ?? setInternalIsOpen

	return (
		<>
			{isOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-black/50 z-40"
					onClick={() => setIsOpen(false)}
				/>
			)}

			<aside
				aria-label="Filtros de productos"
				className={`bg-white/90 rounded-[2rem] backdrop-blur-xl border border-border/30 shadow-xl flex flex-col w-80 fixed inset-0 lg:static lg:translate-x-0 lg:h-auto transition-transform duration-300 z-50 lg:z-auto ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
			>
				<div className="flex flex-col h-full px-6 py-6">
					{/* Header */}
					<header className="shrink-0 flex items-center justify-between mb-4">
						<div className="flex items-center space-x-2">
							<Filter className="h-5 w-5 text-primary" />
							<h2 className="text-lg font-black">Filtros</h2>
						</div>
						{hasActiveFilters && (
							<button onClick={onClearFilters} className="text-xs text-primary">
								Limpiar
							</button>
						)}
					</header>

					{/* Precio (FIJO) */}
					<section className="shrink-0 pb-4 border-b px-6">
						<PriceRangeSlider
							minPrice={priceRange.min}
							maxPrice={priceRange.max}
							currentMin={currentPriceRange.min}
							currentMax={currentPriceRange.max}
							onRangeChange={onUpdatePriceRange}
						/>
					</section>

					{/* Scrollable filters */}
					<section className="flex-1 overflow-y-auto py-4">
						<Accordion
							type="multiple"
							defaultValue={["colores", "paises"]}
							className="space-y-4"
						>
							<FilterSection
								value="colores"
								title="Tipo de vino"
								items={colores.map((color) => ({
									id: `color-${color}`,
									label: color,
									checked: selectedColores.includes(color),
									count: colorCounts[color] || 0,
									onToggle: () => onToggleColor(color),
									icon: getColorIcon(color),
								}))}
							/>

							<FilterSection
								value="paises"
								title="País"
								items={paises.map((pais) => ({
									id: `pais-${pais}`,
									label: pais,
									checked: selectedPaises.includes(pais),
									count: paisCounts[pais] || 0,
									onToggle: () => onTogglePais(pais),
									icon: getCountryFlag(pais),
								}))}
							/>

							{/* Botón para mostrar filtros avanzados - Desktop */}
							<div className="hidden lg:block pt-2">
								<Button
									variant="ghost"
									className="w-full font-bold text-sm"
									onClick={() => setShowAdvanced((v) => !v)}
								>
									{showAdvanced ? "Ocultar avanzados" : "Mostrar más filtros"}
								</Button>
							</div>

							{showAdvanced && (
								<>
									<FilterSection
										value="bodegas"
										title="Bodega"
										items={bodegas.map((bodega) => ({
											id: `bodega-${bodega}`,
											label: bodega,
											checked: selectedBodegas.includes(bodega),
											count: bodegaCounts[bodega] || 0,
											onToggle: () => onToggleBodega(bodega),
										}))}
									/>

									<FilterSection
										value="variedades"
										title="Variedad"
										items={variedades.map((variedad) => ({
											id: `variedad-${variedad}`,
											label: variedad,
											checked: selectedVariedades.includes(variedad),
											count:
												varietalCounts[variedad.toLowerCase()] || 0,
											onToggle: () => onToggleVariedad(variedad),
										}))}
									/>
								</>
							)}
						</Accordion>
					</section>

					{/* Botón fijo - Mobile */}
					<footer className="shrink-0 pt-4 border-t lg:hidden">
						<Button
							variant="ghost"
							className="w-full font-bold"
							onClick={() => setShowAdvanced((v) => !v)}
						>
							{showAdvanced ? "Ocultar avanzados" : "Filtros avanzados"}
						</Button>
					</footer>
				</div>
			</aside>
		</>
	)
}