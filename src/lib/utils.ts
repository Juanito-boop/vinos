import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// Función simple de encriptación usando base64 y una clave secreta
const ENCRYPTION_KEY = "wine-store-secret-key-2024"

/**
 * Encripta un objeto a una cadena Base64URL optimizada.
 * Utiliza Uint8Array y XOR para máxima eficiencia y compatibilidad URL.
 */
export function encryptData(data: any): string {
	try {
		if (!data) return ""
		
		const jsonString = JSON.stringify(data)
		const uint8Array = new TextEncoder().encode(jsonString)
		const keyArray = new TextEncoder().encode(ENCRYPTION_KEY)
		
		const encrypted = uint8Array.map((byte, index) => {
			return byte ^ keyArray[index % keyArray.length]
		})
		
		// Convertir bytes a base64url
		let binary = ""
		encrypted.forEach(byte => binary += String.fromCharCode(byte))
		const base64 = btoa(binary)
		return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
	} catch (error) {
		console.error('Error encrypting data:', error)
		return ''
	}
}

/**
 * Desencripta una cadena Base64URL al objeto original.
 */
export function decryptData(encryptedString: string): any {
	try {
		if (!encryptedString) return null
		
		// Convertir de base64url a base64
		let base64 = encryptedString.replace(/-/g, '+').replace(/_/g, '/')
		while (base64.length % 4) base64 += '='
		
		const binary = atob(base64)
		const uint8Array = new Uint8Array(binary.length)
		const keyArray = new TextEncoder().encode(ENCRYPTION_KEY)
		
		for (let i = 0; i < binary.length; i++) {
			uint8Array[i] = binary.charCodeAt(i) ^ keyArray[i % keyArray.length]
		}
		
		const jsonString = new TextDecoder().decode(uint8Array)
		return JSON.parse(jsonString)
	} catch (error) {
		console.error('Error decrypting data:', error)
		return null
	}
}

/**
 * Interfaz compacta para el estado unificado en la URL
 */
export interface AppURLState {
	v: number; // version
	f?: { // filtros
		p?: [number, number]; // precio [min, max]
		t?: string[]; // tipo (colores)
		pa?: string[]; // pais
		b?: string[]; // bodega
		va?: string[]; // variedad
	};
	c?: Array<{ i: string; q: number }>; // carrito [{i: id, q: quantity}]
}

/**
 * Actualiza el estado unificado en la URL (parámetro 's')
 */
export function updateURLState(key: 'f' | 'c', data: any) {
	if (typeof window === 'undefined') return
  
	const url = new URL(window.location.href)
	const existingS = url.searchParams.get('s')
	let state: AppURLState = { v: 1 }
  
	if (existingS) {
		const decrypted = decryptData(existingS)
		if (decrypted && typeof decrypted === 'object') {
			state = decrypted
		}
	}
  
	// Actualizar o eliminar la sección correspondiente
	if (data === null || data === undefined || (Array.isArray(data) && data.length === 0)) {
		delete state[key]
	} else {
		state[key] = data
	}
  
	// Si solo queda la versión o no hay datos relevantes, eliminar el parámetro 's'
	const hasFiltros = state.f && Object.keys(state.f).length > 0
	const hasCarrito = state.c && state.c.length > 0
  
	if (!hasFiltros && !hasCarrito) {
		url.searchParams.delete('s')
	} else {
		url.searchParams.set('s', encryptData(state))
	}
  
	// Limpieza legacy
	url.searchParams.delete('filters')
	url.searchParams.delete('cart')
  
	window.history.replaceState({}, '', url.toString())
}

/**
 * Obtiene el estado unificado de la URL
 */
export function getURLState(): AppURLState | null {
	if (typeof window === 'undefined') return null
  
	const url = new URL(window.location.href)
	const s = url.searchParams.get('s')
  
	if (s) {
		return decryptData(s)
	}
	
	return null
}

/**
 * Función heredada (legacy) adaptada para el nuevo sistema compacto
 */
export function getDataFromURL(paramName: string): any {
	if (typeof window === 'undefined') return null
	
	const state = getURLState()
	if (state) {
		if (paramName === 'filters' && state.f) return state.f
		if (paramName === 'cart' && state.c) return state.c
	}
  
	const url = new URL(window.location.href)
	const encrypted = url.searchParams.get(paramName)
	if (!encrypted) return null
  
	return decryptData(encrypted)
}

/**
 * Limpia parámetros específicos de la URL, incluyendo el estado unificado si es necesario
 */
export function clearURLParams(...paramNames: string[]) {
	if (typeof window === 'undefined') return
  
	const url = new URL(window.location.href)
	let stateChanged = false
	
	const state = getURLState()
	
	paramNames.forEach(param => {
		if (param === 'filters' || param === 'cart' || param === 's') {
			if (state) {
				if (param === 'filters') delete state.f
				if (param === 'cart') delete state.c
				if (param === 's') {
					delete state.f
					delete state.c
				}
				stateChanged = true
			}
			url.searchParams.delete('filters')
			url.searchParams.delete('cart')
			url.searchParams.delete('s')
		} else {
			url.searchParams.delete(param)
		}
	})
	
	if (stateChanged && state && (state.f || state.c)) {
		url.searchParams.set('s', encryptData(state))
	}
	
	window.history.replaceState({}, '', url.toString())
}

// Guardar la vista actual como texto plano en la URL
export function setViewInURL(view: string) {
	if (typeof window === 'undefined') return
	const url = new URL(window.location.href)
	url.searchParams.set('view', view)
	window.history.replaceState({}, '', url.toString())
}

// Leer la vista actual como texto plano desde la URL
export function getViewFromURL(): string | null {
	if (typeof window === 'undefined') return null
	const url = new URL(window.location.href)
	return url.searchParams.get('view')
}
