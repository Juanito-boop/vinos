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
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Checkbox id={id} checked={checked} onCheckedChange={onToggle} />
        <Label htmlFor={id} className="text-sm font-normal flex items-center space-x-2">
          {icon && <span>{icon}</span>}
          <span>{label}</span>
        </Label>
      </div>
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{count}</span>
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
        <div className="space-y-3 max-h-52 overflow-y-auto">
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
        id: color,
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
        id: pais,
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
        id: bodega,
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
        id: variedad,
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
        className={`bg-gradient-to-b from-white to-red-50 rounded-lg shadow-lg border border-red-100 p-6 h-fit lg:block lg:static lg:translate-x-0 w-72 ${isOpen ? "block" : "hidden"
          } lg:z-auto z-50 fixed lg:relative top-0 left-0 lg:top-auto lg:left-auto max-h-screen lg:max-h-none overflow-y-auto`}
      >
        <div className="hidden lg:flex items-center space-x-2 mb-6">
          <Filter className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900">Filtros</h2>
        </div>

        <Accordion type="multiple" defaultValue={["precio", "colores", "paises"]}>
          {mainFilters.map((section) =>
            section.custom ? (
              <div key={section.value} className="mb-6">{section.custom}</div>
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
          className="w-full mt-4 text-red-600 hover:text-red-700"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "– Ocultar filtros avanzados" : "+ Ver más filtros avanzados"}
        </Button>

        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearFilters} className="w-full mt-4">
            Limpiar Filtros
          </Button>
        )}
      </aside>
    </>
  )
}
