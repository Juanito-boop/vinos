"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "../header"
import { StoreView } from "./store-view"
import { AdminView } from "../admin/admin-view"
import { CartView } from "./cart-view"
import { Footer } from "../footer"
import { useAuth } from "@/providers/auth-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { setViewInURL, getViewFromURL } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from "../ui/button"
import type { Wine } from "@/types"
import { useConsumibles } from "@/hooks/use-consumibles"
import { formatPrice } from "@/utils/price"

type ViewType = "store" | "admin" | "cart"

type WineStoreProps = {
	wines: Wine[]
}

export default function WineStore({ wines }: WineStoreProps) {
	const auth = useAuth()
	const user = auth?.user

	const [currentView, setCurrentView] = useState<ViewType>("store")
	const [searchTerm, setSearchTerm] = useState("")
	const [cartItemCount, setCartItemCount] = useState(0)
	const [filteredWinesCount, setFilteredWinesCount] = useState(0)
	const [isSidebarOpen, setIsSidebarOpen] = useState(false)
	const scrollPositions = useRef<Record<string, number>>({})
	const prevViewRef = useRef<ViewType>(currentView)

	const { consumibles, isLoading: loadingConsumibles, error: errorConsumibles } = useConsumibles();

	// Si no hay parámetro 'view', establecerlo en 'store' y actualizar la URL
	useEffect(() => {
		const viewFromUrl = getViewFromURL() as ViewType | null;
		if (!viewFromUrl) {
			setCurrentView("store");
			setViewInURL("store");
		}
	}, []);

	// Sincronizar la vista con la URL solo en el cliente
	useEffect(() => {
		const viewFromUrl = getViewFromURL() as ViewType
		if (viewFromUrl && viewFromUrl !== currentView) {
			if (viewFromUrl === "admin" && !user?.isAdmin) {
				setCurrentView("store")
				setViewInURL("store")
			} else {
				setCurrentView(viewFromUrl)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.isAdmin])

	// Guardar la vista en la URL cuando cambie
	useEffect(() => {
		setViewInURL(currentView)
	}, [currentView])

	// Gestión de scroll al cambiar de vista
	useEffect(() => {
		const prevView = prevViewRef.current
		if (prevView) {
			scrollPositions.current[prevView] = window.scrollY
		}

		prevViewRef.current = currentView

		const savedPosition = scrollPositions.current[currentView] || 0

		// Timeout para asegurar que el DOM se ha actualizado
		const timeoutId = setTimeout(() => {
			window.scrollTo({
				top: savedPosition,
				behavior: "instant",
			})
		}, 10)

		return () => clearTimeout(timeoutId)
	}, [currentView])

	// Determinar qué vistas están disponibles según el tipo de usuario
	const availableViews = user?.isAdmin
		? ["store", "admin", "cart"] as ViewType[]
		: ["store", "cart"] as ViewType[]

	const handleViewChange = (view: ViewType) => {
		setCurrentView(view)
	}

	return (
		<div className="min-h-screen w-full bg-background relative flex flex-col">
			<Header
				currentView={currentView}
				onViewChange={handleViewChange}
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				cartItemCount={cartItemCount}
				onCartClick={() => { }} // Se maneja dentro de StoreView
				onFiltersClick={() => setIsSidebarOpen(true)}
				filteredWinesCount={filteredWinesCount} // Se calcula dentro de StoreView
				availableViews={availableViews}
			/>

			<main className="relative p-4 md:p-8 rounded-[2rem] bg-[#f0f0f0] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] flex-1 max-w-[98%] xl:max-w-[95%] mx-auto my-6 md:my-10 w-full transition-all duration-500">
				{currentView === "store" && (
					<Tabs defaultValue="Vinos" className="w-full">
						<div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-2">
							<TabsList className="bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-white/20 shadow-sm">
								<TabsTrigger value="Vinos" className="rounded-lg px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">Vinos</TabsTrigger>
								<TabsTrigger value="Comestibles" className="rounded-lg px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">Comestibles</TabsTrigger>
							</TabsList>

							{currentView === "store" && (
								<div className="text-sm font-medium text-gray-500 bg-white/40 px-4 py-2 rounded-full border border-white/20">
									<span className="text-primary font-bold">{filteredWinesCount}</span> productos encontrados
								</div>
							)}
						</div>

						<TabsContent value="Vinos" className="mt-0 outline-none">
							<StoreView
								wines={wines}
								searchTerm={searchTerm}
								onSearchChange={setSearchTerm}
								onFiltersClick={() => setIsSidebarOpen(true)}
								onCartItemCountChange={setCartItemCount}
								onFilteredWinesCountChange={setFilteredWinesCount}
								isSidebarOpen={isSidebarOpen}
								onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
							/>
						</TabsContent>
						<TabsContent value="Comestibles" className="mt-0 outline-none">
							{loadingConsumibles ? (
								<div className="flex items-center justify-center h-64" role="status" aria-live="polite">
									<div className="text-center">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" aria-hidden="true"></div>
										<p className="text-gray-600 font-medium">Cargando delicias...</p>
									</div>
								</div>
							) : errorConsumibles ? (
								<div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
									<p className="text-red-500 font-medium">{errorConsumibles?.message}</p>
								</div>
							) : consumibles.length === 0 ? (
								<div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
									<p className="text-gray-500 font-medium">No hay consumibles disponibles por el momento.</p>
								</div>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
									{consumibles.map((item) => (
										<Card key={item.id} className="flex flex-col items-center bg-white/80 backdrop-blur-sm border-none shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden rounded-2xl">
											<CardHeader className="flex flex-col items-center w-full p-0">
												<div className="relative w-full h-48 overflow-hidden">
													<img
														src={item.url_imagen}
														alt={item.nombre}
														className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
													/>
													<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
												</div>
												<div className="p-6 text-center">
													<CardTitle className="text-xl font-bold text-gray-800 mb-2">{item.nombre}</CardTitle>
													<CardDescription className="text-gray-600 line-clamp-2">{item.descripcion}</CardDescription>
												</div>
											</CardHeader>
											<CardFooter className="p-6 pt-0 w-full flex justify-between items-center border-t border-gray-100/50 mt-auto">
												<span className="text-2xl font-black text-primary">{formatPrice(item.precio)}</span>
												<Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
													Añadir
												</Button>
											</CardFooter>
										</Card>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>
				)}

				{currentView === "admin" && (
					<div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-inner">
						<AdminView wines={wines} />
					</div>
				)}

				{currentView === "cart" && (
					<div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-inner">
						<CartView wines={wines} onBack={() => handleViewChange("store")} />
					</div>
				)}
			</main>

			<Footer />
		</div>

	)
}