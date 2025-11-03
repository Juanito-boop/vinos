"use client"

import type React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CartIcon } from "./ui/cart"
import type { Wine } from "@/types"
import { formatPrice, getCountryFlag } from "@/utils/price"
import { useState } from "react"
import { Pointer } from "lucide-react"

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

  const handleCardClick = () => onClick(wine)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <article
      className="overflow-hidden cursor-pointer h-full flex flex-col bg-gradient-to-b from-white to-red-50 border border-red-100 hover:border-red-300 rounded-lg sm:mx-auto w-full transition-all duration-300 relative group"
      onClick={handleCardClick}
      itemScope
      itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content={wine.nombre} />
      <meta itemProp="description" content={wine.descripcion} />
      <meta itemProp="brand" content={wine.wine_details.bodega} />
      <meta itemProp="category" content="Vino" />
      <meta itemProp="price" content={wine.precio.toString()} />
      <meta itemProp="priceCurrency" content="COP" />

      <CardHeader className="px-0 pt-0">
        <div className="relative overflow-hidden flex items-center justify-center h-44 md:h-52 lg:h-60 p-2">
          <Image
            src={wine.url_imagen || "/placeholder.svg"}
            alt={`Botella de ${wine.nombre} - ${wine.wine_details.bodega}`}
            width={200}
            height={300}
            className="object-contain h-full w-auto mx-auto"
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={priority ? "eager" : "lazy"}
            style={{ objectFit: "contain", maxHeight: "100%" }}
          />
          <Badge
            variant="outline"
            className="absolute top-4 left-4 border-blue-200 text-blue-700 text-xs py-1 px-2 hover:bg-blue-50 transition-colors duration-200 shadow-sm flex items-center gap-1"
            itemProp="countryOfOrigin"
          >
            <span className="text-xs">{getCountryFlag(wine.pais_importacion)} {wine.pais_importacion}</span>
          </Badge>
          <Badge
            variant="outline"
            className="absolute bottom-4 right-4 border-yellow-200 text-yellow-700 text-xs py-1 px-2 hover:bg-yellow-50 transition-colors duration-200 shadow-sm flex items-center gap-1"
            itemProp="additionalProperty"
          >
            <Pointer className="size-4" /> más info
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col">
        <CardTitle
          className="text-lg mb-2 line-clamp-2 min-h-[2.5rem] font-bold text-gray-800 relative pl-3 border-l-4 border-red-500"
          itemProp="name"
        >
          {wine.nombre} {wine.variedades.join(" ")}
          {wine.capacidad < 750 && (
            <span className="ml-1 text-xs font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {wine.capacidad} ml
            </span>
          )}
        </CardTitle>

        <div className="mt-auto bg-gray-50 p-2 rounded-md border border-gray-100 flex items-center justify-between">
          <span className="text-gray-400 text-sm italic">Descripción próximamente</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center gap-2 mt-2">
        <div className="flex flex-col">
          <span
            className="text-2xl font-bold text-red-600 leading-none"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <meta itemProp="price" content={wine.precio.toString()} />
            <meta itemProp="priceCurrency" content="COP" />
            <meta itemProp="availability" content="https://schema.org/InStock" />
            {formatPrice(wine.precio)}
          </span>
        </div>
        <Button
          onClick={handleAddToCart}
          className="bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-300 rounded-md flex items-center justify-center"
          aria-label={`Agregar ${wine.nombre} al carrito`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          size="icon"
        >
          <div className="flex items-center justify-center">
            <CartIcon className="h-5 w-5" isHovered={isHovered} />
          </div>
        </Button>
      </CardFooter>
    </article>
  )
}