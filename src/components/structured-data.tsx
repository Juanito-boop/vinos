"use client"

import { Wine } from "@/types"

interface StructuredDataProps {
	wines?: Wine[]
	type?: "website" | "organization" | "product" | "breadcrumb"
	product?: Wine
}

export function StructuredData({ wines, type = "website", product }: StructuredDataProps) {
	const getWebsiteData = () => ({
		"@context": "https://schema.org",
		"@type": "WebSite",
		"name": "Los Vinos",
		"description": "Tu tienda de vinos preferida en Villa de Leyva, Boyacá",
		"url": "https://wines-theta.vercel.app",
		"potentialAction": {
			"@type": "SearchAction",
			"target": "https://wines-theta.vercel.app?search={search_term_string}",
			"query-input": "required name=search_term_string"
		}
	})

	const getOrganizationData = () => ({
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		"name": "Los Vinos Wine Bar",
		"description": "Tienda online y bar de vinos especializado en etiquetas internacionales",
		"url": "https://wines-theta.vercel.app",
		"logo": "https://wines-theta.vercel.app/logo.png",
		"email": "ventas@vinosdelavilla.com",
		"telephone": "+573219085857",
		"address": {
			"@type": "PostalAddress",
			"streetAddress": "Cra. 9 #11-47",
			"addressLocality": "Villa de Leyva",
			"addressRegion": "Boyacá",
			"addressCountry": "CO"
		},
		"geo": {
			"@type": "GeoCoordinates",
			"latitude": 5.6328438,
			"longitude": -73.5240519
		},
		"hasMap": "https://maps.google.com/maps?cid=8531980845941933546"
	})

	const getProductData = (wine: Wine) => ({
		"@context": "https://schema.org",
		"@type": "Product",
		"name": wine.nombre,
		"description": wine.descripcion,
		"brand": {
			"@type": "Brand",
			"name": wine.wine_details.bodega
		},
		"category": "Vino",
		"image": wine.url_imagen,
		"offers": {
			"@type": "Offer",
			"price": wine.precio,
			"priceCurrency": "COP",
			"availability": "https://schema.org/InStock",
			"seller": {
				"@type": "Organization",
				"name": "Los Vinos"
			}
		},
		"additionalProperty": [
			{
				"@type": "PropertyValue",
				"name": "Variedad",
				"value": wine.variedades.join(", ")
			},
			{
				"@type": "PropertyValue",
				"name": "País",
				"value": wine.pais_importacion
			},
			{
				"@type": "PropertyValue",
				"name": "Alcohol",
				"value": `${wine.nivel_alcohol}%`
			},
			{
				"@type": "PropertyValue",
				"name": "Tipo de Crianza",
				"value": wine.wine_details.tipo_crianza
			}
		]
	})

	const getBreadcrumbData = () => ({
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": [
			{
				"@type": "ListItem",
				"position": 1,
				"name": "Inicio",
				"item": "https://wines-theta.vercel.app"
			},
			{
				"@type": "ListItem",
				"position": 2,
				"name": "Vinos",
				"item": "https://wines-theta.vercel.app/vinos"
			}
		]
	})

	const getData = () => {
		switch (type) {
		case "organization":
			return getOrganizationData()
		case "product":
			return product ? getProductData(product) : null
		case "breadcrumb":
			return getBreadcrumbData()
		default:
			return getWebsiteData()
		}
	}

	const data = getData()
	if (!data) return null

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	)
} 