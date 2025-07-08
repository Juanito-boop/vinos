"use client"

import { useCart } from "@/hooks/use-cart"
import { useFilters } from "@/hooks/use-filters"
import type { Wine } from "@/types"
import { useEffect, useMemo, useState } from "react"

import { FiltersSidebar } from "../filters-sidebar"
import { WineDetailModal } from "../modales/wine-detail-modal"
import { Button } from "../ui/button"
import { WineCard } from "../wine-card"
import { useWineRealtime } from "@/hooks/useRealtimeWines"

interface StoreViewProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  onFiltersClick: () => void
  onCartItemCountChange: (count: number) => void
  onFilteredWinesCountChange: (count: number) => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
}

export function StoreView({
  searchTerm,
  onSearchChange,
  onFiltersClick,
  onCartItemCountChange,
  onFilteredWinesCountChange,
  isSidebarOpen,
  setIsSidebarOpen
}: StoreViewProps) {
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null)
  const [isWineDetailOpen, setIsWineDetailOpen] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(10)

  // Usar el hook mejorado que maneja carga inicial y realtime
  const { wines, isLoading, error } = useWineRealtime()

  const cart = useCart(wines)
  const filters = useFilters(wines)

  const filteredAndSearchedWines = useMemo(() => {
    if (!searchTerm.trim()) return filters.filteredWines

    const searchLower = searchTerm.toLowerCase()
    return filters.filteredWines.filter((wine) => {
      return (
        wine.nombre.toLowerCase().includes(searchLower) ||
        wine.variedades.some((v) => v.toLowerCase().includes(searchLower)) ||
        wine.wine_details.tipo_crianza.toLowerCase().includes(searchLower) ||
        wine.wine_details.bodega.toLowerCase().includes(searchLower) ||
        wine.pais_importacion.toLowerCase().includes(searchLower) ||
        wine.precio.toString().includes(searchTerm)
      )
    })
  }, [filters.filteredWines, searchTerm])

  // Resetear el contador cuando cambien los filtros o búsqueda
  useEffect(() => {
    setDisplayedCount(10)
  }, [filters.filteredWines, searchTerm])

  // Obtener solo los vinos que se deben mostrar
  const displayedWines = useMemo(() => {
    return filteredAndSearchedWines.slice(0, displayedCount)
  }, [filteredAndSearchedWines, displayedCount])

  // Verificar si hay más vinos para cargar
  const hasMoreWines = displayedCount < filteredAndSearchedWines.length

  const loadMoreWines = () => {
    setDisplayedCount(prev => Math.min(prev + 10, filteredAndSearchedWines.length))
  }

  useEffect(() => {
    onCartItemCountChange(cart.cartItemCount)
  }, [cart.cartItemCount, onCartItemCountChange])

  useEffect(() => {
    onFilteredWinesCountChange(filteredAndSearchedWines.length)
  }, [filteredAndSearchedWines.length, onFilteredWinesCountChange])

  const openWineDetail = (wine: Wine) => {
    setSelectedWine(wine)
    setIsWineDetailOpen(true)
  }

  const closeWineDetail = () => {
    setIsWineDetailOpen(false)
    setSelectedWine(null)
  }

  return (
    <div className="flex gap-0 lg:gap-6">
      <aside>
        <FiltersSidebar
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
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
      </aside>

      <main className="flex-1">
        <section aria-label="Catálogo de vinos">
          {isLoading ? (
            <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4" aria-hidden="true"></div>
                <p className="text-gray-600">Cargando vinos...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Información de resultados */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="grid" aria-label="Lista de vinos">
                {displayedWines.map((wine, index) => (
                  <WineCard
                    key={wine.id_vino}
                    wine={wine}
                    onAddToCart={cart.addToCart}
                    onClick={openWineDetail}
                    priority={index < 6}
                  />
                ))}
              </div>

              {/* Botón "Cargar más" */}
              {hasMoreWines && (
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={loadMoreWines}
                    className="bg-red-600 hover:bg-red-700 px-8 py-3 text-lg font-medium"
                  >
                    Cargar más vinos ({Math.min(10, filteredAndSearchedWines.length - displayedCount)} más)
                  </Button>
                </div>
              )}

              {/* Mensaje cuando no hay más vinos para cargar */}
              {!hasMoreWines && filteredAndSearchedWines.length > 0 && (
                <div className="text-center mt-8 py-4">
                  <p className="text-gray-500 text-sm">
                    Has visto todos los vinos disponibles
                  </p>
                </div>
              )}

              {filteredAndSearchedWines.length === 0 && !isLoading && (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-lg">
                    No se encontraron vinos con los filtros aplicados.
                  </p>
                  <Button onClick={filters.clearFilters} className="mt-4">
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <WineDetailModal
        wine={selectedWine}
        isOpen={isWineDetailOpen}
        onClose={closeWineDetail}
        onAddToCart={cart.addToCart}
      />
    </div>
  )
}
