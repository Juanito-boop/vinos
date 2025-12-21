import { supabase } from "@/lib/supabase"
import type { User } from "@/types"

export class AuthService {
	static async signUp(email: string, password: string, name: string) {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					name,
				},
			},
		})

		if (error) throw error
		return data
	}

	static async signIn(email: string, password: string) {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) throw error
		return data
	}

	static async signOut() {
		const { error } = await supabase.auth.signOut()
		if (error) throw error
	}

	static async getCurrentUser(): Promise<User | null> {
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) return null

		const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

		return profile
			? {
				id: profile.id,
				email: profile.email,
				name: profile.name,
				isAdmin: profile.is_admin,
				password: "", // Se agrega el campo 'password' como requerido por el tipo 'User'
			}
			: null
	}

	static onAuthStateChange(callback: (user: User | null) => void) {
		return supabase.auth.onAuthStateChange(async (event, session) => {
			if (session?.user) {
				const user = await this.getCurrentUser()
				callback(user)
			} else {
				callback(null)
			}
		})
	}
}
