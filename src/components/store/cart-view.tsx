"use client"

import { useCart } from "@/hooks/use-cart"
import { WineService } from "@/lib/services/wine-service"
import type { Wine } from "@/types"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react"
import { formatPrice } from "@/utils/price"

interface CartViewProps {
  onBack: () => void
}

function CheckoutQR(
  { cart, ciudad, direccion, nombre, onBack }:
    { cart: any[], ciudad: string, direccion: string, nombre: string, onBack: () => void }) {
  const [timer, setTimer] = useState(60);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  useEffect(() => {
    if (timer === 0 && !whatsappSent) {
      const mensaje = encodeURIComponent(
        `Nombre: ${nombre}\nCiudad: ${ciudad}\nDirección: ${direccion}\n\n` +
        cart.map(item => `${item.nombre} ${item.variedades}\nCantidad: ${item.quantity}\nPrecio: $${item.precio}`).join("\n---\n")
      );
      const numero = "573219085857";

      // Intentar abrir WhatsApp y detectar si está bloqueado
      const whatsappWindow = window.open(`https://wa.me/${numero}?text=${mensaje}`, "_blank");

      if (whatsappWindow) {
        // La ventana se abrió correctamente
        setWhatsappSent(true);
        // Redirigir inmediatamente a la tienda
        setTimeout(() => {
          const url = new URL(window.location.href);
          url.searchParams.set("view", "store");
          window.location.href = url.toString();
        }, 1000);
      } else {
        // La ventana emergente fue bloqueada
        setPopupBlocked(true);
        setWhatsappSent(true);
        // Esperar 15 segundos antes de redirigir
        setTimeout(() => {
          const url = new URL(window.location.href);
          url.searchParams.set("view", "store");
          window.location.href = url.toString();
        }, 15000);
      }
      return;
    }

    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, cart, ciudad, direccion, nombre, whatsappSent]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-2xl font-bold mb-4">Escanea el QR para pagar</h2>
      <img src="/qr-pago.jpg" alt="QR de pago" className="w-56 h-56 mb-4" />

      {!whatsappSent ? (
        <>
          <p className="mb-2 max-w-3xl text-center">En 1 minuto se enviará tu pedido por WhatsApp automáticamente</p>
          <p className="mb-2 max-w-3xl text-center">Si por alguna razon no hay disponibilidad de algun producto, con su pago usted esta reservando el mismo para el siguiente pedido</p>
          <p className="text-lg font-semibold">Tiempo restante: {timer} segundos</p>
        </>
      ) : popupBlocked ? (
        <>
          <p className="mb-2 max-w-3xl text-center text-orange-600 font-semibold">
            ⚠️ Las ventanas emergentes están bloqueadas
          </p>
          <p className="mb-2 max-w-3xl text-center">
            Tu pedido se envió por WhatsApp. Si no se abrió automáticamente,
            puedes hacer clic en el enlace que apareció en la barra de notificaciones.
          </p>
          <p className="mb-2 max-w-3xl text-center">
            Serás redirigido a la tienda en 15 segundos para permitir que autorices la ventana emergente.
          </p>
          <p className="text-lg font-semibold text-orange-600">
            Redirigiendo en 15 segundos...
          </p>
        </>
      ) : (
        <>
          <p className="mb-2 max-w-3xl text-center text-green-600 font-semibold">
            ✅ Pedido enviado por WhatsApp
          </p>
          <p className="mb-2 max-w-3xl text-center">
            Tu pedido se envió correctamente. Serás redirigido a la tienda en unos segundos.
          </p>
        </>
      )}

      <Button onClick={onBack} className="mt-6">Volver al carrito</Button>
    </div>
  );
}

export function CartView({ onBack }: CartViewProps) {
  const [wines, setWines] = useState<Wine[]>([])
  const [showQR, setShowQR] = useState(false);
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [nombre, setNombre] = useState("");
  const [formOk, setFormOk] = useState(false);

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

  if (showQR && formOk) {
    return <CheckoutQR cart={cart.cartItems} ciudad={ciudad} direccion={direccion} nombre={nombre} onBack={() => setShowQR(false)} />;
  }

  if (showQR && !formOk) {
    // Formulario antes del QR
    return (
      <form
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
        onSubmit={e => {
          e.preventDefault();
          if (ciudad && direccion && nombre) setFormOk(true);
        }}
      >
        <h2 className="text-2xl font-bold mb-4">Datos de entrega</h2>
        <input
          className="border p-2 rounded w-64"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded w-64"
          placeholder="Ciudad"
          value={ciudad}
          onChange={e => setCiudad(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded w-64"
          placeholder="Dirección"
          value={direccion}
          onChange={e => setDireccion(e.target.value)}
          required
        />
        <Button type="submit" className="bg-red-600 text-white w-64">Continuar al pago</Button>
        <Button type="button" variant="outline" onClick={() => setShowQR(false)} className="w-64">Volver al carrito</Button>
      </form>
    );
  }

  if (cart.cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-purple-50 to-red-100">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-rows-2 grid-cols-2 lg:grid-cols-4 lg:grid-rows-1 gap-4 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 col-span-2 lg:col-start-2 mx-auto">Carrito de Compras</h1>
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2 lg:col-start-1 lg:row-start-1">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <Badge variant="outline" className="mx-auto px-6 py-2 bg-red-600 text-white font-semibold rounded-md">
              {cart.cartItemCount} {cart.cartItemCount === 1 ? 'artículo' : 'artículos'}
            </Badge>
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
        <div className="grid grid-rows-2 grid-cols-2 lg:grid-cols-4 lg:grid-rows-1 gap-4 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 col-span-2 lg:col-start-2 mx-auto">Carrito de Compras</h1>
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2 lg:col-start-1 lg:row-start-1">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <Badge variant="outline" className="mx-auto px-6 py-2 bg-red-600 text-white font-semibold rounded-md">
            {cart.cartItemCount} {cart.cartItemCount === 1 ? 'artículo' : 'artículos'}
          </Badge>
        </div>

        <p className="text-md font bold text-center mb-8 max-w-[70%] mx-auto">
          Una vez realizado el pago, comenzaremos a procesar el pedido.
          En caso de que algún producto no esté disponible, se notificará oportunamente.
          El pago garantiza la reserva de los productos disponibles.
        </p>

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
                <div className="grid grid-cols-4 gap-2 text-sm px-4 text-gray-800 font-semibold border-b pb-2">
                  <span className="text-left col-span-2">Producto</span>
                  <span className="text-center col-start-3">Cantidad</span>
                  <span className="text-right col-start-4">Subtotal</span>
                </div>
                <div className="divide-y">
                  {cart.cartItems.map((item) => {
                    const wine = wines.find(w => w.id_vino === item.id_vino);
                    if (!wine) return null;
                    return (
                      <div key={item.id_vino} className="grid grid-cols-4 gap-2 text-sm px-4 text-gray-800 items-center py-1">
                        <span className="text-left truncate col-span-2 flex justify-between">
                          <p>{wine.nombre} {wine.variedades.join(", ")}</p> {wine.capacidad} ml
                        </span>
                        <span className="text-center col-start-3">x{item.quantity}</span>
                        <span className="text-right col-start-4">{formatPrice(wine.precio * item.quantity)}</span>
                      </div>
                    );
                  })}
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

                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                  onClick={() => setShowQR(true)}
                >
                  Proceder al pago
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