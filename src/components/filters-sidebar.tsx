"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getCountryFlag } from "@/utils/price"
import { PriceRangeSlider } from "./price-range-slider"

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

function FilterItem({ id, label, checked, count, onToggle, icon }: FilterItemProps) {
	return (
		<div className="flex items-center justify-between group py-1">
			<div className="flex items-center space-x-3">
				<Checkbox
					id={id}
					checked={checked}
					onCheckedChange={() => onToggle()}
					className="shrink-0 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors mt-0.5"
				/>
				<Label htmlFor={id} className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors flex items-center space-x-2 cursor-pointer leading-tight break-words py-1">
					{icon && <span className="text-lg opacity-80 group-hover:opacity-100 transition-opacity shrink-0">{icon}</span>}
					<span className="flex-1">{label}</span>
				</Label>
			</div>
			<span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 group-hover:bg-primary/5 group-hover:text-primary transition-all">
				{count}
			</span>
		</div>
	)
}


interface FilterSectionProps {
  value: string
  title: string
  items: Array<{
    id: string
    label: string
    checked: boolean
    count: number
    onToggle: () => void
    icon?: React.ReactNode
  }>
}

function FilterSection({ value, title, items }: FilterSectionProps) {
	return (
		<AccordionItem value={value}>
			<AccordionTrigger className="text-base font-medium">{title}</AccordionTrigger>
			<AccordionContent>
				<div className="space-y-3 max-h-52 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
					{items.map((item, i) => (
						<FilterItem key={`${item.id}-${i}`} {...item} />
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

export function FiltersSidebar({
	variedades,
	bodegas,
	paises,
	colores,
	selectedVariedades,
	selectedBodegas,
	selectedPaises,
	selectedColores,
	priceRange,
	currentPriceRange,
	onToggleVariedad,
	onToggleBodega,
	onTogglePais,
	onToggleColor,
	onUpdatePriceRange,
	onClearFilters,
	hasActiveFilters,
	varietalCounts,
	bodegaCounts,
	paisCounts,
	colorCounts,
	isOpen: externalIsOpen,
	setIsOpen: externalSetIsOpen,
}: FiltersSidebarProps) {
	const [internalIsOpen, setInternalIsOpen] = useState(false)
	const [showAdvanced, setShowAdvanced] = useState(false)

	const isOpen = externalIsOpen ?? internalIsOpen
	const setIsOpen = externalSetIsOpen ?? setInternalIsOpen

	const mainFilters = [
		{
			value: "precio",
			title: "Precio",
			custom: (
				<PriceRangeSlider
					minPrice={priceRange.min}
					maxPrice={priceRange.max}
					currentMin={currentPriceRange.min}
					currentMax={currentPriceRange.max}
					onRangeChange={onUpdatePriceRange}
				/>
			),
		},
		{
			value: "colores",
			title: "Tipo de Vino",
			items: colores.map((color) => ({
				id: `color-${color}`,
				label: color,
				checked: selectedColores.includes(color),
				count: colorCounts[color] || 0,
				onToggle: () => onToggleColor(color),
				icon: getColorIcon(color),
			})),
		},
		{
			value: "paises",
			title: "País",
			items: paises.map((pais) => ({
				id: `pais-${pais}`,
				label: pais,
				checked: selectedPaises.includes(pais),
				count: paisCounts[pais] || 0,
				onToggle: () => onTogglePais(pais),
				icon: getCountryFlag(pais),
			})),
		},
	]

	const advancedFilters = [
		{
			value: "bodegas",
			title: "Bodega",
			items: bodegas.map((bodega) => ({
				id: `bodega-${bodega}`,
				label: bodega,
				checked: selectedBodegas.includes(bodega),
				count: bodegaCounts[bodega] || 0,
				onToggle: () => onToggleBodega(bodega),
			})),
		},
		{
			value: "variedades",
			title: "Variedad",
			items: variedades.map((variedad) => ({
				id: `variedad-${variedad}`,
				label: variedad,
				checked: selectedVariedades.includes(variedad),
				count: varietalCounts[variedad.toLowerCase()] || 0,
				onToggle: () => onToggleVariedad(variedad),
			})),
		},
	]

	return (
		<>
			{isOpen && (
				<div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
			)}

			<aside
				className={`bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-border/30 p-8 h-fit lg:block lg:static lg:translate-x-0 w-80 transition-all duration-500 ${isOpen ? "block" : "hidden"
				} lg:z-auto z-50 fixed lg:relative top-0 left-0 lg:top-auto lg:left-auto max-h-screen lg:max-h-none overflow-y-auto`}
			>
				<div className="hidden lg:flex items-center justify-between mb-8">
					<div className="flex items-center space-x-3">
						<div className="bg-primary/10 p-2 rounded-xl">
							<Filter className="h-5 w-5 text-primary" />
						</div>
						<h2 className="text-xl font-black text-gray-800 tracking-tight">Filtros</h2>
					</div>
					{hasActiveFilters && (
						<button
							onClick={onClearFilters}
							className="text-[10px] uppercase tracking-widest font-black text-primary/60 hover:text-primary transition-colors"
						>
              Limpiar
						</button>
					)}
				</div>

				<Accordion type="multiple" defaultValue={["precio", "colores", "paises"]} className="space-y-4">
					{mainFilters.map((section) =>
						section.custom ? (
							<div key={section.value} className="mb-0 pt-2">{section.custom}</div>
						) : (
							<FilterSection key={section.value} {...section} />
						)
					)}

					{showAdvanced &&
            advancedFilters.map((section) => (
            	<FilterSection key={section.value} {...section} />
            ))}
				</Accordion>

				<Button
					variant="ghost"
					className="w-full mt-6 text-primary hover:text-primary font-bold bg-primary/5 hover:bg-primary/10 rounded-xl transition-all duration-300"
					onClick={() => setShowAdvanced(!showAdvanced)}
				>
					{showAdvanced ? "Ocultar avanzados" : "Filtros avanzados"}
				</Button>
			</aside>
		</>
	)
}
