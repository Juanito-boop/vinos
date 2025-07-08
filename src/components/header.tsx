"use client"

import { Settings, Search, ShoppingCart, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/providers/auth-provider"
import { LoginModal } from "./modales/login-modal"
import { UserMenu } from "./user-menu"
import WineLogo from "./wine-logo"

interface HeaderProps {
  currentView: "store" | "admin" | "orders" | "cart"
  onViewChange: (view: "store" | "admin" | "orders" | "cart") => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  cartItemCount?: number
  onCartClick?: () => void
  onFiltersClick?: () => void
  filteredWinesCount?: number
  availableViews?: ("store" | "admin" | "orders" | "cart")[]
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

  return (
    <div className="sticky top-0 z-50 bg-white shadow-lg">
      {/* Header principal */}
      <header className="bg-gradient-to-r from-red-100 via-red-50 to-purple-100 border-b border-red-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-72">
              <WineLogo className="size-16" />
              <div className="w-full">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-800 via-red-600 to-purple-700 bg-clip-text text-transparent">
                  Los Vinos
                </h1>
                <p className="text-sm text-gray-600 text-start font-medium">Wine Bar</p>
              </div>
            </div>

            {currentView === "store" && onSearchChange && (
              <div className="hidden lg:block w-full max-w-3xl mx-auto px-4 py-3">
                <div className="flex flex-1 items-center gap-4 mx-auto">
                  <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Buscar por nombre, variedad, año, tipo de crianza, precio..."
                      value={searchTerm}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="pl-12 pr-4 py-3 w-full text-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                                      <Button
                    onClick={() => onViewChange("cart")}
                    className="bg-red-600 hover:bg-red-700 px-4 py-3 flex items-center gap-2 whitespace-nowrap"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="font-medium w-5 text-right">{cartItemCount}</span>
                  </Button>
                </div>
              </div>
            )}

            <div className="hidden lg:block">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {isLoggedIn ? (
                    <UserMenu
                      currentView={currentView}
                      onViewChange={onViewChange}
                      availableViews={availableViews}
                    />
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-purple-600 rounded-lg blur opacity-25"></div>
                      <div className="relative bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-red-100">
                        <LoginModal />
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
                className="bg-red-600 hover:bg-red-700 rounded-lg px-3 py-2 flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="font-medium">{cartItemCount}</span>
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{filteredWinesCount} vinos encontrados</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={onFiltersClick}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg rounded-lg px-3 py-1 text-sm"
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
