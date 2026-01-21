"use client"

import type React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CartIcon } from "./ui/cart"
import type { Wine } from "@/types"
import { formatPrice, getCountryFlag } from "@/utils/price"
import { useState } from "react"
import { Pointer } from "lucide-react"
import { cn } from "@/lib/utils"

interface WineCardProps {
	wine: Wine
	onAddToCart: (wineId: string) => void
	onClick: (wine: Wine) => void
	priority?: boolean
}

export function WineCard({ wine, onAddToCart, onClick, priority = false }: WineCardProps) {
	const handleAddToCart = (e: React.MouseEvent) => {
		e.stopPropagation()
		onAddToCart(wine.id_vino)
	}

	const handleCardClick = () => onClick(wine)
	const [isHovered, setIsHovered] = useState(false)

	return (
		<Card
			className="group overflow-hidden cursor-pointer h-full flex flex-col bg-white rounded-2xl border border-border/50 hover:border-primary/20 shadow-sm hover:shadow-xl transition-all duration-500 relative"
			onClick={handleCardClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			itemScope
			itemType="https://schema.org/Product"
		>
			<meta itemProp="name" content={wine.nombre} />
			<meta itemProp="description" content={wine.descripcion} />
			<meta itemProp="brand" content={wine.wine_details.bodega} />
			<meta itemProp="category" content="Vino" />
			<meta itemProp="price" content={wine.precio.toString()} />
			<meta itemProp="priceCurrency" content="COP" />

			<CardHeader className="p-0">
				<div className="relative overflow-hidden flex items-center justify-center h-48 md:h-56 lg:h-64 p-4 bg-gradient-to-b from-gray-50/50 to-white">
					<div className="absolute inset-0 bg-gradient-radial from-primary/5 to-primary/10 via-primary/5" />
					<Image
						src={wine.url_imagen || "/placeholder.svg"}
						alt={`Botella de ${wine.nombre} - ${wine.wine_details.bodega}`}
						width={200}
						height={300}
						className={cn(
							"object-contain h-full w-auto mx-auto transition-all duration-700",
							wine.url_imagen && "drop-shadow-[0_4px_8px_rgba(0,0,0,0.08)]"
						)}
						priority={priority}
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						loading={priority ? "eager" : "lazy"}
						style={{ objectFit: "contain", maxHeight: "100%", width: "auto" }}
					/>
					<div className="absolute top-3 left-3 flex flex-col gap-2">
						<Badge
							variant="outline"
							className="bg-white/80 backdrop-blur-md border-primary/20 text-primary text-[10px] uppercase tracking-wider py-0.5 px-2 shadow-sm flex items-center gap-1"
							itemProp="countryOfOrigin"
						>
							<span>{getCountryFlag(wine.pais_importacion)} {wine.pais_importacion}</span>
						</Badge>
						{wine.capacidad === 375 && (
							<Badge
								className="bg-primary text-white border-none text-[9px] font-black uppercase tracking-[0.15em] py-1 px-2.5  rounded-lg"
							>
								Media Botella
							</Badge>
						)}
					</div>

					<Badge
						variant="outline"
						className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 border-primary/20 text-primary bg-white/80 backdrop-blur-md text-[10px] uppercase tracking-wider py-0.5 px-2 transition-all duration-300 shadow-sm flex items-center gap-1"
					>
						<Pointer className="size-3" /> ver detalles
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="p-5 flex-1 flex flex-col">
				<div className="mb-2">
					<p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">
						{wine.wine_details.bodega}
					</p>
					<CardTitle
						className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[3rem]"
						itemProp="name"
					>
						{wine.nombre} {wine.variedades.join(" ")}
						{wine.capacidad === 375 && <span className="text-gray-400 font-medium ml-1.5">(Media)</span>}
					</CardTitle>
				</div>

				<div className="flex items-center gap-2 mb-4">
					{wine.capacidad < 750 && (
						<span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase">
							{wine.capacidad} ml
						</span>
					)}
					<span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase">
						{wine.wine_details.tipo_crianza || "Importado"}
					</span>
				</div>

				<div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
					<div className="flex flex-col">
						<span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Precio</span>
						<span
							className="text-2xl font-black text-primary tracking-tight"
							itemProp="offers"
							itemScope
							itemType="https://schema.org/Offer"
						>
							<meta itemProp="price" content={wine.precio.toString()} />
							<meta itemProp="priceCurrency" content="COP" />
							<meta itemProp="availability" content="https://schema.org/InStock" />
							{formatPrice(wine.precio)}
						</span>
					</div>
					<Button
						onClick={handleAddToCart}
						className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/20 transition-all duration-300 rounded-xl h-12 w-12 p-0 flex items-center justify-center shrink-0 group/btn"
						aria-label={`Agregar ${wine.nombre} al carrito`}
					>
						<CartIcon className="h-6 w-6 group-hover/btn:scale-110 transition-transform" isHovered={isHovered} />
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}