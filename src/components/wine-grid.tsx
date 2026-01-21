import type { Wine } from "@/types"
import { WineCard } from "./wine-card"
import { Skeleton } from "./ui/skeleton"

interface WineGridProps {
	wines: Wine[]
	onAddToCart: (wineId: string) => void
	onClick: (wine: Wine) => void
	priority?: boolean
	isLoading?: boolean
}

export function WineGrid({ wines, onAddToCart, onClick, priority = false, isLoading = false }: WineGridProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
				{[...Array(8)].map((_, i) => (
					<div key={i} className="bg-white rounded-2xl border border-border/50 p-5 space-y-4 h-[400px] flex flex-col">
						<Skeleton className="h-48 w-full rounded-xl" />
						<div className="space-y-2">
							<Skeleton className="h-3 w-20" />
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-3/4" />
						</div>
						<div className="flex gap-2">
							<Skeleton className="h-4 w-12 rounded-full" />
							<Skeleton className="h-4 w-12 rounded-full" />
						</div>
						<div className="mt-auto pt-4 flex justify-between items-center">
							<div className="space-y-1">
								<Skeleton className="h-3 w-10" />
								<Skeleton className="h-8 w-24" />
							</div>
							<Skeleton className="h-12 w-12 rounded-xl" />
						</div>
					</div>
				))}
			</div>
		)
	}

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