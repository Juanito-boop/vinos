"use client"

import { useState } from "react"
import { Header } from "./header"
import { StoreView } from "./views/store-view"
import { AdminView } from "./views/admin-view"
import { OrdersView } from "./views/orders-view"
import { CartView } from "./views/cart-view"
import { Footer } from "./footer"
import { useAuth } from "@/providers/auth-provider"
import { useOrderStatus } from "@/providers/order-status-provider"
type ViewType = "store" | "admin" | "orders" | "cart"

export default function WineStore() {
  const [currentView, setCurrentView] = useState<ViewType>("store")
  const [searchTerm, setSearchTerm] = useState("")
  const [cartItemCount, setCartItemCount] = useState(0)
  const [filteredWinesCount, setFilteredWinesCount] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useAuth()

  // Determinar qué vistas están disponibles según el tipo de usuario
  const availableViews = user?.isAdmin 
    ? ["store", "admin", "orders", "cart"] as ViewType[]
    : ["store", "orders", "cart"] as ViewType[]

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-purple-50 to-red-100 flex flex-col">
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        cartItemCount={cartItemCount}
        onCartClick={() => {}} // Se maneja dentro de StoreView
        onFiltersClick={() => setIsSidebarOpen(true)}
        filteredWinesCount={filteredWinesCount} // Se calcula dentro de StoreView
        availableViews={availableViews}
      />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {currentView === "store" && (
            <StoreView
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onFiltersClick={() => setIsSidebarOpen(true)}
              onCartItemCountChange={setCartItemCount}
              onFilteredWinesCountChange={setFilteredWinesCount}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          )}
          
          {currentView === "admin" && <AdminView />}
          
          {currentView === "orders" && <OrdersView />}
          
          {currentView === "cart" && (
            <CartView onBack={() => handleViewChange("store")} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
