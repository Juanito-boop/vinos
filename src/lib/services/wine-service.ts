import { supabase } from "@/lib/supabase"
import type { Wine } from "@/types"

export class WineService {
	static async getAllWines(retries = 3): Promise<Wine[]> {
		for (let attempt = 1; attempt <= retries; attempt++) {
			try {
				const { data, error } = await supabase
					.from("wines")
					.select(`
						*,
						wine_details (
							id_detalle,
							id_vino,
							bodega,
							notas_cata,
							tipo_crianza
						)
					`)
					.order("bodega", { referencedTable: 'wine_details', ascending: true })
					.order("nombre")
					.order("variedades", { ascending: true })
					.order("capacidad", { ascending: false })

				if (error) {
					// Usar warn para intentos fallidos que no son el último
					if (attempt < retries) {
						console.warn(`WineService: Fallo temporal en Supabase (intento ${attempt}/${retries}). Reintentando...`, error.message)
					} else {
						console.error(`WineService: Error fatal en Supabase tras ${retries} intentos:`, error)
					}
					throw error
				}

				if (!data) {
					console.warn(`WineService: No se devolvieron datos de Supabase (intento ${attempt}/${retries})`)
					return []
				}

				return data.map((wine) => ({
					...wine,
					wine_details: wine.wine_details?.[0] || null,
				}))
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : String(err)
				
				if (attempt < retries) {
					console.warn(`WineService: Reintentando carga de vinos (${attempt}/${retries}) debido a: ${errorMessage}`)
					// Esperar un poco antes de reintentar (aumento exponencial corto)
					await new Promise(resolve => setTimeout(resolve, 800 * attempt))
					continue
				}
				
				console.error(`WineService: Error definitivo tras ${retries} intentos:`, err)
				throw new Error(errorMessage)
			}
		}
		return []
	}

	static async getWineById(id: string): Promise<Wine | null> {
		const { data, error } = await supabase
			.from("wines")
			.select(`
				*,
				wine_details (
					id_detalle,
					id_vino,
					bodega,
					notas_cata,
					tipo_crianza
				)
			`)
			.eq("id_vino", id)
			.single()

		if (error) {
			console.error("Error fetching wine:", error)
			return null
		}

		return (
			data ? {
				...data,
				wine_details: data.wine_details[0],
			} : null
		)
	}

	static async createWine(wine: Omit<Wine, "id_vino">): Promise<Wine | null> {
		const { wine_details, ...wineData } = wine

		// Insert wine
		const { data: wineResult, error: wineError } = await supabase.from("wines").insert(wineData).select().single()

		if (wineError) {
			console.error("Error creating wine:", wineError)
			throw wineError
		}

		// Insert wine details
		const { data: detailsResult, error: detailsError } = await supabase
			.from("wine_details")
			.insert({
				...wine_details,
				id_vino: wineResult.id_vino,
			})
			.select()
			.single()

		if (detailsError) {
			console.error("Error creating wine details:", detailsError)
			throw detailsError
		}

		return {
			...wineResult,
			wine_details: detailsResult,
		}
	}

	static async updateWine(id: string, wine: Partial<Wine>): Promise<Wine | null> {
		const { wine_details, ...wineData } = wine

		// Update wine
		const { data: wineResult, error: wineError } = await supabase
			.from("wines")
			.update(wineData)
			.eq("id_vino", id)
			.select()
			.single()

		if (wineError) {
			console.error("Error updating wine:", wineError)
			throw wineError
		}

		// Update wine details if provided
		if (wine_details) {
			const { data: detailsResult, error: detailsError } = await supabase
				.from("wine_details")
				.update(wine_details)
				.eq("id_vino", id)
				.select()
				.single()

			if (detailsError) {
				console.error("Error updating wine details:", detailsError)
				throw detailsError
			}

			return {
				...wineResult,
				wine_details: detailsResult,
			}
		}

		return wineResult
	}

	static async deleteWine(id: string): Promise<boolean> {
		const { error } = await supabase.from("wines").delete().eq("id_vino", id)

		if (error) {
			console.error("Error deleting wine:", error)
			throw error
		}

		return true
	}
}