import type { Wine } from "@/types"
import { WineCard } from "./wine-card"

interface WineGridProps {
  wines: Wine[]
  onAddToCart: (wineId: string) => void
  onClick: (wine: Wine) => void
  priority?: boolean
}

export function WineGrid({ wines, onAddToCart, onClick, priority = false }: WineGridProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
			{wines.map((wine, index) => (
				<WineCard
					key={wine.id_vino}
					wine={wine}
					onAddToCart={onAddToCart}
					onClick={onClick}
					priority={priority && index < 4} // Solo las primeras 4 imágenes con priority
				/>
			))}
		</div>
	)
} 