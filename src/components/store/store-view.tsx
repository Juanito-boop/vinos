"use client"

import { useCart } from "@/hooks/use-cart"
import { useFilters } from "@/hooks/use-filters"
import type { Wine } from "@/types"
import { useEffect, useMemo, useState } from "react"

import { FiltersSidebar } from "../filters-sidebar"
import { WineDetailModal } from "./wine-detail-modal"
import { Button } from "../ui/button"
import { WineGrid } from "../wine-grid"
import { useConsumibles } from "@/hooks/use-consumibles"

interface StoreViewProps {
  wines: Wine[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onFiltersClick: () => void
  onCartItemCountChange: (count: number) => void
  onFilteredWinesCountChange: (count: number) => void
  isSidebarOpen: boolean
  onSidebarToggle: () => void
}

export function StoreView({
  wines,
  searchTerm,
  onFilteredWinesCountChange,
  isSidebarOpen,
  onSidebarToggle,
}: StoreViewProps) {
  const { addToCart } = useCart(wines)
  const filters = useFilters(wines)
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { consumibles, isLoading: loadingConsumibles, error: errorConsumibles } = useConsumibles();

  // Filtrar vinos basado en búsqueda y filtros
  const filteredWines = useMemo(() => {
    let filtered = filters.filteredWines

    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (wine) =>
          wine.nombre.toLowerCase().includes(searchLower) ||
          wine.wine_details.bodega.toLowerCase().includes(searchLower) ||
          wine.variedades.some((variedad) =>
            variedad.toLowerCase().includes(searchLower)
          ) ||
          wine.wine_details.tipo_crianza.toLowerCase().includes(searchLower) ||
          wine.pais_importacion.toLowerCase().includes(searchLower) ||
          wine.precio.toString().includes(searchTerm)
      )
    }

    return filtered
  }, [filters.filteredWines, searchTerm])

  // Actualizar contador de elementos en el carrito
  useEffect(() => {
    // Este efecto se ejecutará cuando cambie el carrito
    // El contador se actualiza desde el hook useCart
  }, [])

  // Actualizar contador de vinos filtrados
  useEffect(() => {
    onFilteredWinesCountChange(filteredWines.length)
  }, [filteredWines.length, onFilteredWinesCountChange])

  // Estado para controlar cuántos productos mostrar (paginación por filas)
  const [visibleRows, setVisibleRows] = useState(3)

  // Determinar el número de columnas según el tamaño de pantalla
  // Para simplificar, asumimos 4 columnas en 2xl, 3 en lg, 2 en sm, 1 en base
  // Pero para la lógica, mostramos de a 3 filas (3*4=12, 3*3=9, etc)
  // Usamos 12 como máximo por página para la experiencia más fluida
  const itemsPerRow = 4 // Puedes ajustar esto si quieres que sea responsivo con JS
  const itemsToShow = visibleRows * itemsPerRow

  // Productos a mostrar actualmente
  const winesToShow = useMemo(() => filteredWines.slice(0, itemsToShow), [filteredWines, itemsToShow])

  // Mostrar el botón solo si hay más productos para mostrar
  const showMoreButton = filteredWines.length > winesToShow.length

  const handleAddToCart = (wineId: string) => {
    addToCart(wineId)
  }

  const handleWineClick = (wine: Wine) => {
    setSelectedWine(wine)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedWine(null)
  }

  return (
      <div className="flex-1 flex flex-row gap-6 min-h-0">
        {selectedWine && (
          <WineDetailModal
            wine={selectedWine}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onAddToCart={handleAddToCart}
          />
        )}
        {/* Sidebar de filtros */}
        <FiltersSidebar
          isOpen={isSidebarOpen}
          setIsOpen={onSidebarToggle}
          variedades={filters.variedades}
          bodegas={filters.bodegas}
          paises={filters.paises}
          colores={filters.colores}
          selectedVariedades={filters.filters.selectedVariedades}
          selectedBodegas={filters.filters.selectedBodegas}
          selectedPaises={filters.filters.selectedPaises}
          selectedColores={filters.filters.selectedColores}
          priceRange={filters.priceRange}
          currentPriceRange={filters.filters.priceRange}
          onToggleVariedad={filters.toggleVariedad}
          onToggleBodega={filters.toggleBodega}
          onTogglePais={filters.togglePais}
          onToggleColor={filters.toggleColor}
          onUpdatePriceRange={filters.updatePriceRange}
          onClearFilters={filters.clearFilters}
          hasActiveFilters={filters.hasActiveFilters}
          varietalCounts={filters.varietalCounts}
          bodegaCounts={filters.bodegaCounts}
          paisCounts={filters.paisCounts}
          colorCounts={filters.colorCounts}
        />

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto">
          {filteredWines.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron vinos
              </h3>
              <p className="text-gray-600 mb-4">
                Intenta ajustar tus filtros o términos de búsqueda
              </p>
              <Button onClick={filters.clearFilters} variant="outline">
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <>
              <WineGrid
                wines={winesToShow}
                onAddToCart={handleAddToCart}
                onClick={handleWineClick}
                priority={true}
              />
              {showMoreButton && (
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={() => setVisibleRows(visibleRows + 3)} 
                    variant="outline" 
                    className="max-w-60 w-full bg-red-600 hover:bg-red-700 text-white hover:text-white"
                  >
                    Mostrar más
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
  )
}
