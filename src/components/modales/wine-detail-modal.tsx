"use client"

import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Wine } from "@/types"
import { formatPrice, getCountryFlag } from "@/utils/price"

interface WineDetailModalProps {
  wine: Wine | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (wineId: string) => void
}

export function WineDetailModal({ wine, isOpen, onClose, onAddToCart }: WineDetailModalProps) {
  if (!wine) return null

  const handleAddToCart = () => {
    onAddToCart(wine.id_vino)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{wine.nombre}</DialogTitle>
          <DialogDescription>
            Información detallada sobre {wine.nombre} de {wine.wine_details.bodega}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 h-full">
          <div className="flex justify-center md:block">
            <Image
              src={wine.url_imagen || "/placeholder.svg"}
              alt={`Botella de ${wine.nombre} - ${wine.wine_details.bodega}`}
              width={300}
              height={400}
              className="mx-auto max-w-xs md:max-w-none md:mx-auto h-32 md:h-80 object-contain rounded-lg"
              priority
            />
          </div>

          <div className="max-h-[50vh] md:max-h-[70vh] space-y-3 md:space-y-4 overflow-y-auto px-2 md:px-4 pb-3">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Información General</h3>
              <div className="space-y-1 sm:space-y-2 text-xs md:text-sm">
                <p>
                  <span className="font-medium">Bodega:</span> {wine.wine_details.bodega}
                </p>
                <p>
                  <span className="font-medium">País:</span> {getCountryFlag(wine.pais_importacion)}{" "}
                  {wine.pais_importacion}
                </p>
                <p>
                  <span className="font-medium">Variedades:</span> {wine.variedades.join(", ")}
                </p>
                <p>
                  <span className="font-medium">Tipo de crianza:</span> {wine.wine_details.tipo_crianza}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{wine.descripcion}</p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Características</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs md:text-sm">
                <div>
                  <p className="font-medium text-gray-700">Graduación alcohólica</p>
                  <p className="text-gray-600">{wine.nivel_alcohol}% Vol.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Color</p>
                  <p className="text-gray-600">{wine.color_vino}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Contenido de azúcar</p>
                  <p className="text-gray-600">{wine.wine_details.contenido_azucar}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Tipo</p>
                  <p className="text-gray-600">{wine.wine_details.contenido_carbonico}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Notas de Cata</h3>
              <p className="text-gray-600 leading-relaxed">{wine.wine_details.notas_cata}</p>
            </div>

            <div className="flex flex-wrap gap-1 sm:gap-2" role="group" aria-label="Etiquetas del vino">
              {wine.variedades.map((variedad) => (
                <Badge key={variedad} variant="secondary" className="bg-red-100 text-red-800 text-xs">
                  {variedad}
                </Badge>
              ))}
              <Badge variant="outline" className="border-red-200 text-red-700">
                {wine.wine_details.bodega}
              </Badge>
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                {getCountryFlag(wine.pais_importacion)} {wine.pais_importacion}
              </Badge>
            </div>

            <div className="border-t pt-3 sm:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                <span className="text-2xl md:text-3xl font-bold text-red-600" aria-label={`Precio: ${formatPrice(wine.precio)}`}>
                  {formatPrice(wine.precio)}
                </span>
                <div className="text-left sm:text-right">
                  <p className="text-xs md:text-sm text-gray-500">Precio por botella</p>
                  <p className="text-xs text-green-600">✓ Disponible</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:flex-3">
                <Button 
                  onClick={handleAddToCart} 
                  className="w-full bg-red-600 hover:bg-red-700 text-sm md:text-base"
                  aria-label={`Agregar ${wine.nombre} al carrito`}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Agregar al Carrito
                </Button>
                <Button 
                  variant="outline" 
                  className="sm:px-6 text-sm sm:text-base bg-transparent"
                  aria-label="Reservar este vino"
                >
                  Reservar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
