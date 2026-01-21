"use client"

import { useState } from "react"
import Image from "next/image"
import { Pointer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CartIcon } from "./ui/cart"
import type { Wine } from "@/types"
import { formatPrice, getCountryFlag } from "@/utils/price"
import { cn } from "@/lib/utils"

interface WineCardProps {
	wine: Wine
	onAddToCart: (wineId: string) => void
	onClick: (wine: Wine) => void
	priority?: boolean
}

export function WineCard({
	wine,
	onAddToCart,
	onClick,
	priority = false,
}: WineCardProps) {
	const [hovered, setHovered] = useState(false)

	return (
		<Card
			onClick={() => onClick(wine)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			className="group h-full cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-white transition-all duration-500 hover:border-primary/20 hover:shadow-xl"
			itemScope
			itemType="https://schema.org/Product"
		>
			{/* SEO */}
			<meta itemProp="name" content={wine.nombre} />
			<meta itemProp="description" content={wine.descripcion} />
			<meta itemProp="brand" content={wine.wine_details.bodega} />
			<meta itemProp="price" content={wine.precio.toString()} />
			<meta itemProp="priceCurrency" content="COP" />

			<CardHeader className="p-0">
				<div className="relative flex h-56 items-center justify-center bg-gradient-to-b from-gray-50/50 to-white p-4">
					<Image
						src={wine.url_imagen || "/placeholder.svg"}
						alt={wine.nombre}
						width={200}
						height={300}
						priority={priority}
						loading={priority ? "eager" : "lazy"}
						className={cn(
							"h-full w-auto object-contain transition-all duration-700",
							wine.url_imagen && "drop-shadow-[0_4px_8px_rgba(0,0,0,0.08)]"
						)}
					/>

					<div className="absolute left-3 top-3 space-y-2 flex flex-col">
						<Badge variant="outline" className="bg-white/80 text-[10px]">
							{getCountryFlag(wine.pais_importacion)} {wine.pais_importacion}
						</Badge>
						{wine.capacidad === 375 && (
							<Badge className="bg-primary text-[9px] font-black">
								Media Botella
							</Badge>
						)}
					</div>

					<Badge className="absolute bottom-3 right-3 opacity-0 transition group-hover:opacity-100">
						<Pointer className="mr-1 size-3" /> ver detalles
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="flex flex-1 flex-col p-5">
				<div className="min-h-[4.5rem]">
					<p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
						{wine.wine_details.bodega}
					</p>

					<CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-primary font-bold leading-snug">
						{wine.nombre} {wine.variedades.join(" ")}
						{wine.capacidad === 375 && (
							<span className="ml-1 text-gray-400 font-medium">(Media)</span>
						)}
					</CardTitle>
				</div>

				<div className="mb-4 flex gap-2 h-6 items-center">
					{wine.capacidad < 750 && (
						<span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase shrink-0">
							{wine.capacidad} ml
						</span>
					)}
					<span className="rounded-full bg-primary/5 px-2 py-0.5 text-[10px] font-bold uppercase text-primary truncate">
						{wine.wine_details.tipo_crianza || "Importado"}
					</span>
				</div>

				<div className="mt-auto flex items-center justify-between border-t pt-4">
					<div className="flex flex-col">
						<span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Precio</span>
						<span className="text-2xl font-black text-primary tracking-tight">
							{formatPrice(wine.precio)}
						</span>
					</div>

					<Button
						onClick={(e) => {
							e.stopPropagation()
							onAddToCart(wine.id_vino)
						}}
						className="h-12 w-12 rounded-xl p-0 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/20 transition-all duration-300"
						aria-label="Agregar al carrito"
					>
						<CartIcon isHovered={hovered} />
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}