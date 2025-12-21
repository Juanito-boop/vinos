import { supabase } from "@/lib/supabase"
import type { CartItem } from "@/types"

export class CartService {
	static async getCartItems(userId: string): Promise<CartItem[]> {
		const { data, error } = await supabase.from("cart_items").select("*").eq("user_id", userId)

		if (error) {
			console.error("Error fetching cart items:", error)
			throw error
		}

		return (
			data?.map((item) => ({
				id: item.wine_id,
				quantity: item.quantity,
			})) || []
		)
	}

	static async addToCart(userId: string, wineId: string, quantity = 1): Promise<void> {
		const { error } = await supabase.from("cart_items").upsert(
			{
				user_id: userId,
				wine_id: wineId,
				quantity,
			},
			{
				onConflict: "user_id,wine_id",
			},
		)

		if (error) {
			console.error("Error adding to cart:", error)
			throw error
		}
	}

	static async updateCartItem(userId: string, wineId: string, quantity: number): Promise<void> {
		if (quantity <= 0) {
			await this.removeFromCart(userId, wineId)
			return
		}

		const { error } = await supabase.from("cart_items").update({ quantity }).eq("user_id", userId).eq("wine_id", wineId)

		if (error) {
			console.error("Error updating cart item:", error)
			throw error
		}
	}

	static async removeFromCart(userId: string, wineId: string): Promise<void> {
		const { error } = await supabase.from("cart_items").delete().eq("user_id", userId).eq("wine_id", wineId)

		if (error) {
			console.error("Error removing from cart:", error)
			throw error
		}
	}

	static async clearCart(userId: string): Promise<void> {
		const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

		if (error) {
			console.error("Error clearing cart:", error)
			throw error
		}
	}
}
