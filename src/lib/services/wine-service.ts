import { supabase } from "@/lib/supabase"
import type { Wine } from "@/types"

export class WineService {
	static async getAllWines(): Promise<Wine[]> {
		try {
			// WineService: Fetching all wines...
			
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
				console.error("WineService: Supabase error:", error)
				throw new Error(`Error fetching wines: ${error.message || 'Unknown error'}`)
			}

			if (!data) {
				console.warn('WineService: No data returned from Supabase')
				return []
			}

			const normalizedWines = data.map((wine) => ({
				...wine,
				wine_details: wine.wine_details?.[0] || null,
			}))
			
			return normalizedWines
		} catch (err) {
			console.error("WineService: Error in getAllWines:", err)
			
			// Crear un error más informativo
			let errorMessage = 'Error fetching wines'
			if (err instanceof Error) {
				errorMessage = err.message
			} else if (typeof err === 'string') {
				errorMessage = err
			} else if (err && typeof err === 'object') {
				errorMessage = JSON.stringify(err)
			}
			
			throw new Error(errorMessage)
		}
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