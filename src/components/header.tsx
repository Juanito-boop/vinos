"use client"

import { Settings, Search, ShoppingCart, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/providers/auth-provider"
import { LoginModal } from "./store/login-modal"
import { UserMenu } from "./user-menu"
import WineLogo from "./wine-logo"
import { useState } from "react"
import { CartIcon } from "./ui/cart"

interface HeaderProps {
  currentView: "store" | "admin" | "cart"
  onViewChange: (view: "store" | "admin" | "cart") => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  cartItemCount?: number
  onCartClick?: () => void
  onFiltersClick?: () => void
  filteredWinesCount?: number
  availableViews?: ("store" | "admin" | "cart")[]
}

export function Header({
	currentView,
	onViewChange,
	searchTerm = "",
	onSearchChange,
	cartItemCount = 0,
	onCartClick,
	onFiltersClick,
	filteredWinesCount = 0,
	availableViews = ["store"],
}: HeaderProps) {
	const { isLoggedIn, user } = useAuth()
	const [isHovered, setIsHovered] = useState(false)

	return (
		<div className="sticky top-0 z-50">
			{/* Header principal */}
			<header className="bg-white/70 backdrop-blur-xl border-b border-primary/10 shadow-sm transition-all duration-300">
				<div className="max-w-[95%] mx-auto px-6 py-4">
					<div className="flex items-center justify-between gap-8">
						<div
							className="flex items-center space-x-4 cursor-pointer group shrink-0"
							onClick={() => onViewChange("store")}
						>
							<div className="relative">
								<div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:bg-primary/30 transition-all duration-500" />
								<WineLogo className="size-14 relative transform group-hover:scale-110 transition-transform duration-500" />
							</div>
							<div className="flex flex-col">
								<h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-primary via-primary/90 to-red-900 bg-clip-text text-transparent">
                  Los Vinos
								</h1>
								<p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/60 -mt-1">Wine Bar</p>
							</div>
						</div>

						{currentView === "store" && onSearchChange && (
							<div className="hidden lg:flex flex-1 max-w-2xl mx-auto items-center gap-4">
								<div className="relative flex-1 group">
									<div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
										<Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
									</div>
									<Input
										type="text"
										placeholder="Encuentra tu vino ideal..."
										value={searchTerm}
										onChange={(e) => onSearchChange(e.target.value)}
										className="pl-12 pr-4 py-6 w-full text-base bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 rounded-2xl transition-all duration-300"
									/>
								</div>
								<Button
									onClick={() => onViewChange("cart")}
									className="bg-primary hover:bg-primary/90 text-white px-6 h-[52px] rounded-2xl flex items-center gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all duration-300 group/cart"
									onMouseEnter={() => setIsHovered(true)}
									onMouseLeave={() => setIsHovered(false)}
								>
									<CartIcon className="h-5 w-5 group-hover/cart:scale-110 transition-transform" isHovered={isHovered} />
									<span className="font-bold text-lg border-l border-white/20 pl-3">{cartItemCount}</span>
								</Button>
							</div>
						)}

						<div className="hidden lg:flex items-center space-x-4 shrink-0">
							{isLoggedIn ? (
								<UserMenu
									currentView={currentView}
									onViewChange={onViewChange}
									availableViews={availableViews}
								/>
							) : (
								<div className="bg-white/50 backdrop-blur-sm rounded-2xl p-0.5 shadow-sm border border-primary/5 hover:border-primary/20 transition-all duration-300">
									<LoginModal />
								</div>
							)}
						</div>
					</div>
				</div>
			</header>


			{/* Barra de búsqueda móvil - solo mostrar en vista de tienda */}
			{currentView === "store" && onSearchChange && (
				<div className="lg:hidden bg-white border-b border-gray-200">
					<div className="container mx-auto px-4 py-3">
						<div className="flex items-center gap-3 mb-3">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									type="text"
									placeholder="Buscar vinos..."
									value={searchTerm}
									onChange={(e) => onSearchChange(e.target.value)}
									className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
								/>
							</div>
							<Button
								onClick={() => onViewChange("cart")}
								className="bg-primary hover:bg-primary/90 rounded-lg px-3 py-2 flex items-center gap-2"
							>
								<ShoppingCart className="h-4 w-4" />
								<span className="font-medium">{cartItemCount}</span>
							</Button>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-600 font-medium">{filteredWinesCount} vinos encontrados</span>
							<div className="flex items-center gap-2">
								<Button
									onClick={onFiltersClick}
									className="bg-primary hover:bg-primary/90 text-white shadow-lg rounded-lg px-3 py-1 text-sm font-bold"
									size="sm"
								>
									<Filter className="h-4 w-4 mr-2" />
                  Filtros
								</Button>
								{isLoggedIn && (
									<UserMenu
										currentView={currentView}
										onViewChange={onViewChange}
										availableViews={availableViews}
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
