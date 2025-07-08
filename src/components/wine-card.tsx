"use client"

import type React from "react"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Wine } from "@/types"
import { formatPrice, getCountryFlag } from "@/utils/price"

interface WineCardProps {
  wine: Wine
  onAddToCart: (wineId: string) => void
  onClick: (wine: Wine) => void
  priority?: boolean
}

export function WineCard({ wine, onAddToCart, onClick, priority = false }: WineCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToCart(wine.id_vino)
  }

  return (
    <article
      className="overflow-hidden hover:shadow-xl cursor-pointer h-full flex flex-col bg-gradient-to-b from-white to-red-50 border border-red-100 hover:border-red-300 rounded-lg sm:mx-auto w-full"
      onClick={() => onClick(wine)}
      itemScope
      itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content={wine.nombre} />
      <meta itemProp="description" content={wine.descripcion} />
      <meta itemProp="brand" content={wine.wine_details.bodega} />
      <meta itemProp="category" content="Vino" />
      <meta itemProp="price" content={wine.precio.toString()} />
      <meta itemProp="priceCurrency" content="COP" />

      <CardHeader className="px-0">
        <div className="relative overflow-hidden">
          <Image
            src={wine.url_imagen || "/placeholder.svg"}
            alt={`Botella de ${wine.nombre} - ${wine.wine_details.bodega}`}
            width={200}
            height={300}
            className="object-cover mx-auto h-52"
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={priority ? "eager" : "lazy"}
            style={{ height: "auto" }}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col">
        <CardTitle
          className="text-lg mb-2 line-clamp-2 min-h-[2.5rem]"
          itemProp="name"
        >
            {wine.nombre} {wine.color_vino} {wine.capacidad < 750 ? wine.capacidad : ""}
        </CardTitle>

        <div className="flex flex-wrap gap-2 mb-3 align-middle">
          {wine.variedades.map((variedad) => (
            <Badge
              key={variedad}
              variant="secondary"
              className="bg-red-100 text-red-800 text-xs"
              itemProp="additionalProperty"
            >
              {variedad}
            </Badge>
          ))}
          <Badge
            variant="outline"
            className="border-red-200 text-red-700 text-xs"
            itemProp="brand"
          >
            {wine.wine_details.bodega}
          </Badge>
          <Badge
            variant="outline"
            className="border-blue-200 text-blue-700 text-xs"
            itemProp="countryOfOrigin"
          >
            {getCountryFlag(wine.pais_importacion)} {wine.pais_importacion}
          </Badge>
        </div>

        <div className="text-sm text-gray-500 mt-auto">
          <p itemProp="additionalProperty">
            {wine.wine_details.tipo_crianza} • {wine.nivel_alcohol}% Vol.
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-start gap-2">
        <span
          className="text-2xl font-bold text-red-600 my-auto"
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
        >
          <meta itemProp="price" content={wine.precio.toString()} />
          <meta itemProp="priceCurrency" content="CLP" />
          <meta itemProp="availability" content="https://schema.org/InStock" />
          {formatPrice(wine.precio)}
        </span>
        <Button
          onClick={handleAddToCart}
          className="bg-red-600 hover:bg-red-700"
          aria-label={`Agregar ${wine.nombre} al carrito`}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </article>
  )
}
