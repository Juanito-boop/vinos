"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Wine } from "@/types"
import { formatPrice, getCountryFlag } from "@/utils/price"
import { CartIcon } from "../ui/cart"
import { Minus, Plus, Grape, Hourglass, Globe, Droplet } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

interface WineDetailModalProps {
	wine: Wine | null
	isOpen: boolean
	onClose: () => void
	onAddToCart: (wineId: string) => void
}

export function WineDetailModal({ wine, isOpen, onClose, onAddToCart }: WineDetailModalProps) {
	const [isHovered, setIsHovered] = useState(false)
	const [quantity, setQuantity] = useState(1)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (isOpen) {
			setIsLoading(true)
			const timer = setTimeout(() => setIsLoading(false), 600)
			return () => clearTimeout(timer)
		}
	}, [isOpen])

	if (!wine) return null

	const handleAddToCart = () => {
		for (let i = 0; i < quantity; i++) {
			onAddToCart(wine.id_vino)
		}
		onClose()
	}

	const incrementQuantity = () => setQuantity(prev => prev + 1)
	const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1)

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				hideClose
				className="max-w-[90%] lg:max-w-4xl md:max-w-3xl max-h-[95vh] md:max-h-[90vh] overflow-hidden p-0 bg-white backdrop-blur-xl border-none shadow-2xl rounded-[2rem] flex flex-col h-full md:h-auto"
			>
				<div className="flex flex-col h-full">
					<DialogHeader className="p-8 pb-4 relative flex flex-row justify-between">
						<div className="flex flex-col items-start text-start gap-1 max-w-[70%]">
							{isLoading ? (
								<>
									<VisuallyHidden>
										<DialogTitle>{wine.nombre}</DialogTitle>
										<DialogDescription>{wine.descripcion}</DialogDescription>
									</VisuallyHidden>
									<div className="space-y-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-8 w-48" />
									</div>
								</>
							) : (
								<>
									<div className="flex items-center gap-2">
										<p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/60">{wine.wine_details.bodega}</p>
										{wine.capacidad === 375 && (
											<Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md h-fit">
												Media Botella
											</Badge>
										)}
									</div>
									<DialogTitle className="text-2xl font-black tracking-tight text-gray-900">
										{wine.nombre}
										{wine.capacidad === 375 && <span className="text-gray-400 font-medium ml-2">(Media Botella)</span>}
									</DialogTitle>
									<VisuallyHidden>
										<DialogDescription>{wine.descripcion}</DialogDescription>
									</VisuallyHidden>
								</>
							)}
						</div>
						<Button
							variant="ghost"
							onClick={onClose}
							className="text-[10px] font-black uppercase tracking-widest hover:text-primary hover:bg-primary/5 rounded-xl px-4 h-9 transition-all ring-1 ring-primary/60 text-primary/60"
						>
							Cerrar
						</Button>
					</DialogHeader>

					<div className="flex flex-col md:flex-row flex-1 md:grid md:grid-cols-2 gap-0 min-h-0">
						<div className="p-4 md:p-8 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50/50 to-white md:border-r border-gray-100 flex-shrink min-h-0">
							{isLoading ? (
								<div className="w-full space-y-8">
									<Skeleton className="h-[300px] w-[180px] mx-auto rounded-2xl" />
									<div className="space-y-4 hidden md:block">
										<div className="flex justify-between items-end">
											<div className="space-y-2">
												<Skeleton className="h-3 w-20" />
												<Skeleton className="h-8 w-32" />
											</div>
											<Skeleton className="h-10 w-32 rounded-xl" />
										</div>
										<Skeleton className="h-12 w-full rounded-xl" />
									</div>
								</div>
							) : (
								<>
									<div className="relative group w-full max-w-[120px] sm:max-w-[150px] md:max-w-none mx-auto flex-shrink">
										<div className="absolute inset-0 bg-gradient-radial from-primary/5 to-primary/10 via-primary/5" />
										<Image
											src={wine.url_imagen || "/placeholder.svg"}
											alt={`Botella de ${wine.nombre} - ${wine.wine_details.bodega}`}
											width={300}
											height={400}
											className="relative mx-auto drop-shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-all duration-700 h-auto w-auto max-h-[20vh] sm:max-h-36 md:max-h-[300px] object-contain"
											priority
										/>
									</div>

									<div className="w-full space-y-6 hidden md:block">
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
														aria-label="Disminuir cantidad"
													>
														<Minus className="h-3.5 w-3.5" />
													</Button>
													<span className="px-3 font-black text-primary min-w-[2.5rem] text-center text-sm">{quantity}</span>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7 rounded-lg text-primary hover:bg-white transition-all"
														onClick={incrementQuantity}
														aria-label="Aumentar cantidad"
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
												aria-label="Añadir al carrito"
											>
												<CartIcon className="h-4 w-4 text-white" isHovered={isHovered} />
												AÑADIR A LA CAVA
											</Button>
										</div>
									</div>
								</>
							)}
						</div>

						<div className="p-6 py-0 md:pt-0 md:p-8 bg-white overflow-hidden flex flex-col min-h-0 flex-1">
							{isLoading ? (
								<div className="space-y-8">
									<div className="flex gap-2">
										<Skeleton className="h-10 flex-1 rounded-xl" />
										<Skeleton className="h-10 flex-1 rounded-xl" />
									</div>
									<div className="space-y-4">
										<Skeleton className="h-4 w-32" />
										<div className="grid grid-cols-2 gap-4">
											{[...Array(4)].map((_, i) => (
												<div key={i} className="space-y-2">
													<Skeleton className="h-3 w-16" />
													<Skeleton className="h-6 w-full rounded-lg" />
												</div>
											))}
										</div>
									</div>
									<div className="space-y-3">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-24 w-full rounded-2xl" />
									</div>
								</div>
							) : (
								<>
									{/* Vista Desktop - Original */}
									<div className="hidden md:block space-y-8 overflow-y-auto">
										<Tabs defaultValue="información" className="w-full bg-white">
											<TabsList className="grid w-full grid-cols-2 gap-2 mb-2 p-1 bg-transparent h-auto">
												<TabsTrigger
													value="información"
													className="rounded-xl text-xs font-black uppercase tracking-widest bg-gray-100/90 text-gray-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:ring-1 data-[state=active]:ring-gray-300 py-3"
												>
													información
												</TabsTrigger>
												<TabsTrigger
													value="cata"
													className="rounded-xl text-xs font-black uppercase tracking-widest bg-gray-100/90 text-gray-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:ring-1 data-[state=active]:ring-gray-300 py-3"
												>
													Cata
												</TabsTrigger>
											</TabsList>

											<TabsContent value="información" className="flex flex-col mt-0">
												<section>
													<h3 className="text-xs uppercase tracking-[0.2em] font-black text-primary/40 mb-4 flex items-center gap-2">
														<span className="h-px w-8 bg-primary/20" /> Perfil del vino
													</h3>

													<div className="grid grid-cols-2 gap-y-4 gap-x-6 my-3">
														<div className="space-y-1">
															<p className="text-[10px] uppercase font-bold text-gray-400">Variedades</p>
															<div className="flex flex-wrap gap-2">
																<Grape className="w-3 h-3 text-primary/60 my-auto" />
																{wine.variedades.map((variedad) => (
																	<Badge key={variedad} variant="secondary" className="bg-primary/5 text-primary border-none font-bold uppercase text-[10px] tracking-widest px-3 py-1">
																		{variedad}
																	</Badge>
																))}
															</div>
														</div>
														<div className="space-y-1">
															<p className="text-[10px] uppercase font-bold text-gray-400">Crianza</p>
															<div className="flex flex-wrap gap-2">
																<Hourglass className="w-3 h-3 text-primary/60 my-auto" />
																<Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold uppercase text-[10px] tracking-widest px-3 py-1">
																	{wine.wine_details.tipo_crianza || "Importado"}
																</Badge>
															</div>
														</div>
														<div className="space-y-1">
															<p className="text-[10px] uppercase font-bold text-gray-400">Origen</p>
															<div className="flex flex-wrap gap-2">
																<Globe className="w-3 h-3 text-primary/60 my-auto" />
																<Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold uppercase text-[10px] tracking-widest px-3 py-1">
																	{getCountryFlag(wine.pais_importacion)} {wine.pais_importacion}
																</Badge>
															</div>
														</div>
														<div className="space-y-1">
															<p className="text-[10px] uppercase font-bold text-gray-400">Alcohol</p>
															<div className="flex flex-wrap gap-2">
																<Droplet className="w-3 h-3 text-primary/60 my-auto" />
																<Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold uppercase text-[10px] tracking-widest px-3 py-1">{wine.nivel_alcohol}% Vol.</Badge>
															</div>
														</div>
													</div>
												</section>

												<section>
													<h3 className="text-xs uppercase tracking-[0.2em] font-black text-primary/40 mb-3 flex items-center gap-2">
														<span className="h-px w-8 bg-primary/20" /> Descripción
													</h3>
													<div className="bg-primary/[0.03] p-6 rounded-2xl border border-primary/5 italic text-gray-700 text-sm leading-relaxed">
														&quot; {wine.descripcion || "Descripcion próximamente..."} &quot;
													</div>
												</section>
											</TabsContent>

											<TabsContent value="cata" className="flex flex-col mt-0">
												<section>
													<h3 className="text-xs uppercase tracking-[0.2em] font-black text-primary/40 mb-3 flex items-center gap-2">
														<span className="h-px w-8 bg-primary/20" /> Notas de Cata
													</h3>
													<div className="bg-primary/[0.03] p-6 rounded-2xl border border-primary/5 italic text-gray-700 text-sm leading-relaxed">
														&quot; {wine.wine_details.notas_cata || "Notas de cata próximamente..."} &quot;
													</div>
												</section>
											</TabsContent>
										</Tabs>
									</div>

									{/* Vista Móvil - Tabs */}
									<div className="md:hidden flex flex-col min-h-0 h-full">
										<Tabs defaultValue="perfil" className="w-full bg-white flex flex-col h-full">
											<TabsList className="grid w-full grid-cols-2 gap-2 mb-4 p-1 bg-transparent h-auto flex-shrink-0">
												<TabsTrigger
													value="perfil"
													className="rounded-xl text-xs font-black uppercase tracking-widest bg-gray-100/90 text-gray-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:ring-1 data-[state=active]:ring-gray-300 py-3"
												>
													Perfil
												</TabsTrigger>
												<TabsTrigger
													value="descripcion"
													className="rounded-xl text-xs font-black uppercase tracking-widest bg-gray-100/90 text-gray-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:ring-1 data-[state=active]:ring-gray-300 py-3"
												>
													Descripción
												</TabsTrigger>
												<TabsTrigger
													value="notas"
													className="col-span-2 rounded-xl text-xs font-black uppercase tracking-widest bg-gray-100/90 text-gray-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:ring-1 data-[state=active]:ring-gray-300 py-3"
												>
													notas de cata
												</TabsTrigger>
											</TabsList>

											<div className="flex-1 overflow-y-auto min-h-0 pb-4">
												<TabsContent value="perfil" className="space-y-6 mt-0">
													<section className="grid grid-cols-2 gap-y-4 gap-x-4">
														<div className="space-y-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
															<div className="flex items-center gap-2 mb-1">
																<Grape className="w-3 h-3 text-primary/60" aria-hidden="true" />
																<p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Variedades</p>
															</div>
															<p className="text-xs font-bold text-gray-800 leading-tight">{wine.variedades.join(", ")}</p>
														</div>
														<div className="space-y-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
															<div className="flex items-center gap-2 mb-1">
																<Hourglass className="w-3 h-3 text-primary/60" aria-hidden="true" />
																<p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Crianza</p>
															</div>
															<p className="text-xs font-bold text-gray-800 leading-tight">{wine.wine_details.tipo_crianza || "Importado"}</p>
														</div>
														<div className="space-y-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
															<div className="flex items-center gap-2 mb-1">
																<Globe className="w-3 h-3 text-primary/60" aria-hidden="true" />
																<p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Origen</p>
															</div>
															<p className="text-xs font-bold text-gray-800 leading-tight flex items-center gap-1.5">
																<span className="text-base">{getCountryFlag(wine.pais_importacion)}</span> {wine.pais_importacion}
															</p>
														</div>
														<div className="space-y-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
															<div className="flex items-center gap-2 mb-1">
																<Droplet className="w-3 h-3 text-primary/60" aria-hidden="true" />
																<p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Alcohol</p>
															</div>
															<p className="text-xs font-bold text-gray-800 leading-tight">{wine.nivel_alcohol}% Vol.</p>
														</div>
													</section>
												</TabsContent>

												<TabsContent value="descripcion" className="space-y-4 mt-0">
													<section className="space-y-3">
														<h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/40 flex items-center gap-2">
															<span className="h-px w-6 bg-primary/20" /> Descripción
														</h3>
														<div className="bg-primary/[0.03] p-5 rounded-2xl border border-primary/5 italic text-gray-700 text-sm leading-relaxed">
															&quot; {wine.descripcion || "Descripcion próximamente..."} &quot;
														</div>
													</section>
												</TabsContent>

												<TabsContent value="notas" className="space-y-4 mt-0">
													<section className="space-y-3">
														<h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/40 flex items-center gap-2">
															<span className="h-px w-6 bg-primary/20" /> Notas de Cata
														</h3>
														<div className="bg-primary/[0.03] p-5 rounded-2xl border border-primary/5 italic text-gray-700 text-sm leading-relaxed">
															&quot; {wine.wine_details.notas_cata || "Notas de cata próximamente..."} &quot;
														</div>
													</section>
												</TabsContent>
											</div>
										</Tabs>
									</div>
								</>
							)}
						</div>
					</div>

					<div className="md:hidden p-4 border-t border-gray-100 bg-white space-y-4 shrink-0 z-10">
						{isLoading ? (
							<div className="flex flex-col gap-4">
								<div className="flex justify-between items-center">
									<div className="space-y-1">
										<Skeleton className="h-8 w-32" />
										<Skeleton className="h-3 w-24" />
									</div>
									<Skeleton className="h-10 w-32 rounded-xl" />
								</div>
								<Skeleton className="h-12 w-full rounded-xl" />
							</div>
						) : (
							<>
								<div className="flex items-center justify-between">
									<div className="flex flex-col">
										<span className="text-2xl font-black text-primary">{formatPrice(wine.precio)}</span>
										<p className="text-[10px] text-gray-400 uppercase font-bold">Impuestos incluidos</p>
									</div>
									<div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
										<Button
											variant="ghost"
											size="icon"
											className="h-9 w-9 rounded-lg text-primary hover:bg-white transition-all"
											onClick={decrementQuantity}
											aria-label="Disminuir cantidad"
										>
											<Minus className="h-4 w-4" />
										</Button>
										<span className="px-4 font-black text-primary min-w-[3rem] text-center">{quantity}</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-9 w-9 rounded-lg text-primary hover:bg-white transition-all"
											onClick={incrementQuantity}
											aria-label="Aumentar cantidad"
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								</div>
								<Button
									onClick={handleAddToCart}
									className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl font-black tracking-widest text-sm shadow-lg shadow-primary/20"
									aria-label="Añadir al carrito"
								>
									AÑADIR A LA CAVA
								</Button>
							</>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

