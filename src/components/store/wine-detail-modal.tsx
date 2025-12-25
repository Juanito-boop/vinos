"use client"

import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Wine } from "@/types"
import { formatPrice, getCountryFlag } from "@/utils/price"
import { useState } from "react"
import { CartIcon } from "../ui/cart"
import { Minus, Plus } from "lucide-react"

interface WineDetailModalProps {
	wine: Wine | null
	isOpen: boolean
	onClose: () => void
	onAddToCart: (wineId: string) => void
}

export function WineDetailModal({ wine, isOpen, onClose, onAddToCart }: WineDetailModalProps) {
	const [isHovered, setIsHovered] = useState(false)
	const [quantity, setQuantity] = useState(1)

	if (!wine) return null

	const handleAddToCart = () => {
		// Note: Assuming onAddToCart can take a quantity, 
		// but if not, we might need to call it multiple times 
		// or update the context. For now, let's keep it simple 
		// and assume the user wants to see the selector.
		for (let i = 0; i < quantity; i++) {
			onAddToCart(wine.id_vino)
		}
		onClose()
	}

	const incrementQuantity = () => setQuantity(prev => prev + 1)
	const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1)

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden p-0 bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-[2rem] flex flex-col">
				<div className="flex flex-col h-full">
					<DialogHeader className="p-8 pb-4">
						<div className="flex flex-col gap-1">
							<p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/60">{wine.wine_details.bodega}</p>
							<DialogTitle className="text-2xl font-black tracking-tight text-gray-900">{wine.nombre}</DialogTitle>
						</div>
					</DialogHeader>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-0 flex-1 overflow-hidden">
						<div className="p-8 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50/50 to-white md:border-r border-gray-100">
							<div className="relative group">
								<div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
								<Image
									src={wine.url_imagen || "/placeholder.svg"}
									alt={`Botella de ${wine.nombre} - ${wine.wine_details.bodega}`}
									width={300}
									height={400}
									className="relative mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-700 h-auto w-auto max-h-[300px] object-contain"
									priority
								/>
							</div>

							<div className="w-full mt-8 space-y-6 hidden md:block">
								<div className="flex flex-col gap-4">
									<div className="flex items-center justify-between">
										<div className="flex flex-col">
											<span className="text-[10px] uppercase tracking-widest font-black text-gray-400">Precio especial</span>
											<span className="text-xl font-black text-primary tracking-tighter">
												{formatPrice(wine.precio)}
											</span>
										</div>
										<div className="flex items-center bg-gray-100 rounded-xl p-0.5 border border-gray-200">
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 rounded-lg text-primary hover:bg-white transition-all"
												onClick={decrementQuantity}
											>
												<Minus className="h-3.5 w-3.5" />
											</Button>
											<span className="px-3 font-black text-primary min-w-[2.5rem] text-center text-sm">{quantity}</span>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 rounded-lg text-primary hover:bg-white transition-all"
												onClick={incrementQuantity}
											>
												<Plus className="h-3.5 w-3.5" />
											</Button>
										</div>
									</div>

									<Button
										onClick={handleAddToCart}
										className="w-full bg-primary hover:bg-primary/90 h-10 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-300 text-sm font-black tracking-wide gap-3"
										onMouseEnter={() => setIsHovered(true)}
										onMouseLeave={() => setIsHovered(false)}
									>
										<CartIcon className="h-4 w-4" isHovered={isHovered} />
										AÑADIR A LA CAVA
									</Button>
								</div>
							</div>
						</div>

						<div className="p-8 space-y-8 bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
							<section>
								<h3 className="text-xs uppercase tracking-[0.2em] font-black text-primary/40 mb-4 flex items-center gap-2">
									<span className="h-px w-8 bg-primary/20" /> Perfil del vino
								</h3>
								
								<div className="grid grid-cols-2 gap-y-4 gap-x-6 my-3">
									<div className="space-y-1">
										<p className="text-[10px] uppercase font-bold text-gray-400">Variedades</p>
										<p className="text-sm font-bold text-gray-800">{wine.variedades.join(", ")}</p>
									</div>
									<div className="space-y-1">
										<p className="text-[10px] uppercase font-bold text-gray-400">Crianza</p>
										<p className="text-sm font-bold text-gray-800">{wine.wine_details.tipo_crianza || "Importado"}</p>
									</div>
									<div className="space-y-1">
										<p className="text-[10px] uppercase font-bold text-gray-400">Origen</p>
										<p className="text-sm font-bold text-gray-800 flex items-center gap-2">
											{getCountryFlag(wine.pais_importacion)} {wine.pais_importacion}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-[10px] uppercase font-bold text-gray-400">Alcohol</p>
										<p className="text-sm font-bold text-gray-800">{wine.nivel_alcohol}% Vol.</p>
									</div>
								</div>

								<div className="flex flex-wrap gap-2">
									{wine.variedades.map((variedad) => (
										<Badge key={variedad} variant="secondary" className="bg-primary/5 text-primary border-none font-bold uppercase text-[10px] tracking-widest px-3 py-1">
											{variedad}
										</Badge>
									))}
									<Badge variant="outline" className="border-primary/10 text-primary/60 font-medium uppercase text-[10px] tracking-widest px-3 py-1">
										Reserva Especial
									</Badge>
								</div>
							</section>

							<section>
								<h3 className="text-xs uppercase tracking-[0.2em] font-black text-primary/40 mb-3 flex items-center gap-2">
									<span className="h-px w-8 bg-primary/20" /> Descripción
								</h3>
								<p className="text-gray-600 text-sm leading-relaxed font-medium">
									{wine.descripcion || "Un vino excepcional seleccionado cuidadosamente para nuestra exclusiva colección."}
								</p>
							</section>

							<section>
								<h3 className="text-xs uppercase tracking-[0.2em] font-black text-primary/40 mb-3 flex items-center gap-2">
									<span className="h-px w-8 bg-primary/20" /> Notas de Cata
								</h3>
								<div className="bg-primary/[0.03] p-6 rounded-2xl border border-primary/5 italic text-gray-700 text-sm leading-relaxed">
									&quot;{wine.wine_details.notas_cata || "Notas de cata próximamente..."}&quot;
								</div>
							</section>

							{/* Mobile CTA */}
							<div className="md:hidden pt-8 mt-8 border-t border-gray-100 space-y-6">
								<div className="flex items-center justify-between">
									<div className="flex flex-col">
										<span className="text-3xl font-black text-primary">{formatPrice(wine.precio)}</span>
										<p className="text-[10px] text-gray-400 uppercase font-bold">Impuestos incluidos</p>
									</div>
									<div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 rounded-lg text-primary hover:bg-white transition-all"
											onClick={decrementQuantity}
										>
											<Minus className="h-4 w-4" />
										</Button>
										<span className="px-4 font-black text-primary min-w-[3rem] text-center">{quantity}</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 rounded-lg text-primary hover:bg-white transition-all"
											onClick={incrementQuantity}
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								</div>
								<Button
									onClick={handleAddToCart}
									className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl font-black tracking-widest text-sm"
								>
									AÑADIR A LA CAVA
								</Button>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

