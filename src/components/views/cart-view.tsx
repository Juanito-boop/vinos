"use client"

import { useCart } from "@/hooks/use-cart"
import { WineService } from "@/lib/services/wine-service"
import type { Wine } from "@/types"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react"
import { formatPrice } from "@/utils/price"

interface CartViewProps {
  onBack: () => void
}

export function CartView({ onBack }: CartViewProps) {
  const [wines, setWines] = useState<Wine[]>([])

  useEffect(() => {
    const loadWines = async () => {
      try {
        const winesData = await WineService.getAllWines()
        setWines(winesData)
      } catch (error) {
        console.error("Error loading wines:", error)
      }
    }
    loadWines()
  }, [])

  const cart = useCart(wines)

  if (cart.cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-purple-50 to-red-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Carrito de Compras</h1>
          </div>

          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Tu carrito está vacío</h2>
              <p className="text-gray-500 mb-4">Agrega algunos vinos para comenzar tu compra</p>
              <Button onClick={onBack} className="bg-red-600 hover:bg-red-700">
                Continuar Comprando
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-purple-50 to-red-100">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-rows-2 grid-cols-2 lg:grid-cols-4 lg:grid-rows-1 gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 col-span-2 lg:col-start-2 mx-auto">Carrito de Compras</h1>
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2 lg:col-start-1 lg:row-start-1">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <Badge variant="outline" className="mx-auto px-6 py-2 bg-red-600 text-white font-semibold rounded-md">
            {cart.cartItemCount} {cart.cartItemCount === 1 ? 'artículo' : 'artículos'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {cart.cartItems.map((item) => {
              const wine = wines.find(w => w.id_vino === item.id_vino)
              if (!wine) return null

              return (
                <Card key={item.id_vino} className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 mx-auto sm:mx-0">
                        {wine.url_imagen && (
                          <img
                            src={wine.url_imagen}
                            alt={wine.nombre}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 w-full">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                          {wine.nombre} {wine.variedades.join(", ")} {wine.capacidad < 750 ? wine.capacidad : ""}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1 sm:mb-2">
                          {wine.wine_details.bodega} • {wine.pais_importacion}
                        </p>
                        <p className="text-base sm:text-lg font-bold text-start text-red-600">
                          {formatPrice(wine.precio)}
                        </p>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-4 mt-2 sm:mt-0 w-full sm:w-auto justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cart.updateQuantity(item.id_vino, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cart.updateQuantity(item.id_vino, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                         <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cart.removeFromCart(item.id_vino)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:underline hover:underline-offset-1 mx-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cart.cartItemCount} {cart.cartItemCount === 1 ? 'artículo' : 'artículos'})</span>
                  <span>{formatPrice(cart.cartTotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(cart.cartTotal)}</span>
                  </div>
                </div>

                <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-3">
                  Proceder al Pago
                </Button>

                <Button variant="outline" onClick={onBack} className="w-full">
                  Continuar Comprando
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}