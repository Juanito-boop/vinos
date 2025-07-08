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

// Componente reutilizable para elementos de filtro
interface FilterItemProps {
  id: string
  label: string
  checked: boolean
  count: number
  onToggle: () => void
  icon?: React.ReactNode
  hasScroll?: boolean
}

function FilterItem({ id, label, checked, count, onToggle, icon, hasScroll = false }: FilterItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onToggle}
        />
        <Label htmlFor={id} className="text-sm font-normal flex items-center space-x-2">
          {icon && <span>{icon}</span>}
          <span>{label}</span>
        </Label>
      </div>
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
        {count}
      </span>
    </div>
  )
}

// Componente reutilizable para secciones de filtro
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
  hasScroll?: boolean
}

function FilterSection({ value, title, items, hasScroll = false }: FilterSectionProps) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="text-base font-medium">{title}</AccordionTrigger>
      <AccordionContent>
        <div className={`space-y-3 ${hasScroll ? 'max-h-52 overflow-y-auto' : ''}`}>
          {items.map((item, index) => (
            <FilterItem
              key={`${item.id}-${index}`}
              id={item.id}
              label={item.label}
              checked={item.checked}
              count={item.count}
              onToggle={item.onToggle}
              icon={item.icon}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

// Función helper para obtener el icono del color
function getColorIcon(color: string) {
  return (
    <div
      className={`w-3 h-3 rounded-full ${
        color === "Tinto"
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

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = externalSetIsOpen || setInternalIsOpen

  // Configuración de las secciones de filtro
  const filterSections = [
    {
      value: "variedades",
      title: "Variedades",
      items: variedades.map((variedad) => ({
        id: variedad,
        label: variedad,
        checked: selectedVariedades.includes(variedad),
        count: varietalCounts[variedad] || 0,
        onToggle: () => onToggleVariedad(variedad),
      })),
      hasScroll: true,
    },
    {
      value: "paises",
      title: "Países",
      items: paises.map((pais) => ({
        id: pais,
        label: pais,
        checked: selectedPaises.includes(pais),
        count: paisCounts[pais] || 0,
        onToggle: () => onTogglePais(pais),
        icon: getCountryFlag(pais),
      })),
    },
    {
      value: "bodegas",
      title: "Bodegas",
      items: bodegas.map((bodega) => ({
        id: bodega,
        label: bodega,
        checked: selectedBodegas.includes(bodega),
        count: bodegaCounts[bodega] || 0,
        onToggle: () => onToggleBodega(bodega),
      })),
      hasScroll: true,
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
  ]

  return (
    <>
      {/* Overlay para móvil/tablet */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-white to-red-50 rounded-lg shadow-lg border border-red-100 p-6 h-fit lg:block lg:static lg:translate-x-0 w-72 ${isOpen ? "block" : "hidden"}
        lg:z-auto z-50
        fixed lg:relative top-0 left-0 lg:top-auto lg:left-auto
        max-h-screen lg:max-h-none overflow-y-auto
      `}
      >
        {/* Botón cerrar para móvil/tablet */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filtros</h2>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Título del sidebar */}
        <div className="hidden lg:flex items-center space-x-2 mb-6">
          <Filter className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900">Filtros</h2>
        </div>

        {/* Filtro de precio */}
        <div className="mb-6">
          <PriceRangeSlider
            minPrice={priceRange.min}
            maxPrice={priceRange.max}
            currentMin={currentPriceRange.min}
            currentMax={currentPriceRange.max}
            onRangeChange={onUpdatePriceRange}
          />
        </div>

        {/* Acordeón con filtros */}
        <Accordion type="multiple" defaultValue={["variedades", "bodegas", "paises", "colores"]}>
          {filterSections.map((section, index) => (
            <FilterSection
              key={`${section.value}-${index}`}
              value={section.value}
              title={section.title}
              items={section.items}
              hasScroll={section.hasScroll}
            />
          ))}
        </Accordion>

        {/* Botones de acción */}
        {hasActiveFilters && (
          <>
            <Button variant="outline" onClick={onClearFilters} className="w-full mt-4">
              Limpiar Filtros
            </Button>
            <Button onClick={() => setIsOpen(false)} className="lg:hidden w-full mt-2 bg-red-600 hover:bg-red-700">
              Aplicar Filtros
            </Button>
          </>
        )}
      </aside>
    </>
  )
}
