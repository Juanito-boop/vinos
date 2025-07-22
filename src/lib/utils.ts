import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función simple de encriptación usando base64 y una clave secreta
const ENCRYPTION_KEY = "wine-store-secret-key-2024"

// Función para validar datos antes de encriptar
function isValidData(data: any, defaultPriceRange: { min: number, max: number } = { min: 0, max: 0 }): boolean {
  if (data === null || data === undefined) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data === 'object') {
    // Considerar filtros
    const hasActiveFilters =
      (data.selectedVariedades && data.selectedVariedades.length > 0) ||
      (data.selectedBodegas && data.selectedBodegas.length > 0) ||
      (data.selectedPaises && data.selectedPaises.length > 0) ||
      (data.selectedColores && data.selectedColores.length > 0);

    // Considerar rango de precios distinto al valor por defecto
    const hasCustomPriceRange =
      data.priceRange && typeof data.priceRange === 'object' &&
      (data.priceRange.min !== defaultPriceRange.min ||
        data.priceRange.max !== defaultPriceRange.max);

    return hasActiveFilters || hasCustomPriceRange;
  }
  return false;
}

export function encryptData(data: any, defaultPriceRange?: { min: number, max: number }): string {
  try {
    // Validar datos antes de encriptar
    if (!isValidData(data, defaultPriceRange)) {
      return ''
    }
    
    const jsonString = JSON.stringify(data)
    const encoded = btoa(jsonString)
    // Aplicar una transformación simple para mayor seguridad
    const encrypted = encoded.split('').map((char, index) => {
      const keyChar = ENCRYPTION_KEY[index % ENCRYPTION_KEY.length]
      const charCode = char.charCodeAt(0) ^ keyChar.charCodeAt(0)
      return String.fromCharCode(charCode)
    }).join('')
    return btoa(encrypted)
  } catch (error) {
    console.error('Error encrypting data:', error)
    return ''
  }
}

export function decryptData(encryptedString: string): any {
  try {
    const decoded = atob(encryptedString)
    const decrypted = decoded.split('').map((char, index) => {
      const keyChar = ENCRYPTION_KEY[index % ENCRYPTION_KEY.length]
      const charCode = char.charCodeAt(0) ^ keyChar.charCodeAt(0)
      return String.fromCharCode(charCode)
    }).join('')
    const jsonString = atob(decrypted)
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Error decrypting data:', error)
    return null
  }
}

// Función para actualizar la URL con datos encriptados
export function updateURLWithData(data: any, paramName: string) {
  if (typeof window === 'undefined') return
  
  const encrypted = encryptData(data)
  const url = new URL(window.location.href)
  
  if (encrypted) {
    url.searchParams.set(paramName, encrypted)
  } else {
    url.searchParams.delete(paramName)
  }
  
  // Usar replaceState para no agregar entradas al historial
  window.history.replaceState({}, '', url.toString())
}

// Función para obtener datos de la URL
export function getDataFromURL(paramName: string): any {
  if (typeof window === 'undefined') return null
  
  const url = new URL(window.location.href)
  const encrypted = url.searchParams.get(paramName)
  
  if (!encrypted) {
    return null
  }
  
  return decryptData(encrypted)
}

// Función para limpiar parámetros de la URL
export function clearURLParams(...paramNames: string[]) {
  if (typeof window === 'undefined') return
  
  const url = new URL(window.location.href)
  paramNames.forEach(param => url.searchParams.delete(param))
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
