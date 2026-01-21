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
	isLoading?: boolean
}

export function StoreView({
	wines,
	searchTerm,
	onSearchChange,
	onFiltersClick,
	onCartItemCountChange,
	onFilteredWinesCountChange,
	isSidebarOpen,
	onSidebarToggle,
	isLoading = false,
}: StoreViewProps) {
	const { addToCart, cartItemCount } = useCart(wines)
	const filters = useFilters(wines)
	const [selectedWine, setSelectedWine] = useState<Wine | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { consumibles, isLoading: loadingConsumibles, error: errorConsumibles } = useConsumibles();

	const filteredWines = useMemo(() => {
		let filtered = filters.filteredWines

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

	useEffect(() => {
		onCartItemCountChange(cartItemCount)
	}, [cartItemCount, onCartItemCountChange])

	useEffect(() => {
		onFilteredWinesCountChange(filteredWines.length)
	}, [filteredWines.length, onFilteredWinesCountChange])

	const [visibleRows, setVisibleRows] = useState(3)
	const itemsPerRow = 4
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
				{isLoading ? (
					<WineGrid
						wines={[]}
						onAddToCart={handleAddToCart}
						onClick={handleWineClick}
						isLoading={true}
					/>
				) : filteredWines.length === 0 ? (
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
									className="max-w-60 w-full bg-primary hover:bg-primary/90 text-white hover:text-white"
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
