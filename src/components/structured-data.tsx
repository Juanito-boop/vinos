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
		"description": "Tienda online de vinos internacionales",
		"url": "https://tu-dominio.com",
		"potentialAction": {
			"@type": "SearchAction",
			"target": "https://tu-dominio.com?search={search_term_string}",
			"query-input": "required name=search_term_string"
		}
	})

	const getOrganizationData = () => ({
		"@context": "https://schema.org",
		"@type": "Organization",
		"name": "Los Vinos",
		"description": "Tienda online especializada en vinos internacionales",
		"url": "https://tu-dominio.com",
		"logo": "https://tu-dominio.com/logo.png",
		"contactPoint": {
			"@type": "ContactPoint",
			"telephone": "+56-9-1234-5678",
			"contactType": "customer service",
			"areaServed": "CL",
			"availableLanguage": "Spanish"
		},
		"address": {
			"@type": "PostalAddress",
			"addressCountry": "CL",
			"addressLocality": "Santiago",
			"addressRegion": "Región Metropolitana"
		}
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
				"item": "https://tu-dominio.com"
			},
			{
				"@type": "ListItem",
				"position": 2,
				"name": "Vinos",
				"item": "https://tu-dominio.com/vinos"
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