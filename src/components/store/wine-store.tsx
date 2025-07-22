"use client"

import { useState, useEffect } from "react"
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
  const { user } = useAuth()

  const [currentView, setCurrentView] = useState<ViewType>("store")
  const [searchTerm, setSearchTerm] = useState("")
  const [cartItemCount, setCartItemCount] = useState(0)
  const [filteredWinesCount, setFilteredWinesCount] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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

  // Determinar qué vistas están disponibles según el tipo de usuario
  const availableViews = user?.isAdmin
    ? ["store", "admin", "cart"] as ViewType[]
    : ["store", "cart"] as ViewType[]

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
  }

  return (
    <div className="min-h-screen w-full bg-white relative flex flex-col">
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
            <Tabs defaultValue="Vinos"  className="w-full">
              <TabsList>
                <TabsTrigger value="Vinos">Vinos</TabsTrigger>
                <TabsTrigger value="Comestibles">Comestibles</TabsTrigger>
              </TabsList>
              <TabsContent value="Vinos">
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
              <TabsContent value="Comestibles">
                {loadingConsumibles ? (
                  <div className="flex items-center justify-center h-32" role="status" aria-live="polite">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4" aria-hidden="true"></div>
                      <p className="text-gray-600">Cargando consumibles...</p>
                    </div>
                  </div>
                ) : errorConsumibles ? (
                  <div className="text-center text-red-500">{errorConsumibles?.message}</div>
                ) : consumibles.length === 0 ? (
                  <div className="text-center text-gray-500">No hay consumibles disponibles.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {consumibles.map((item) => (
                      <Card key={item.id} className="flex flex-col items-center">
                        <CardHeader className="flex flex-col items-center">
                          <img src={item.url_imagen} alt={item.nombre} className="w-32 h-32 object-cover mb-2 rounded" />
                          <CardTitle className="text-lg text-center">{item.nombre}</CardTitle>
                          <CardDescription className="text-center">{item.descripcion}</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0 flex justify-between items-start gap-2">
                          <span className="text-2xl font-bold text-red-600 my-auto">{formatPrice(item.precio)}</span>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {currentView === "admin" && <AdminView wines={wines} />}

          {currentView === "cart" && (
            <CartView onBack={() => handleViewChange("store")} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}