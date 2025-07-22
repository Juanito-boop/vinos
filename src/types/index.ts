export interface Wine {
  id_vino: string;
  nombre: string;
  precio: number;
  url_imagen: string;
  descripcion: string;
  nivel_alcohol: number;
  variedades: string[];
  pais_importacion: string;
  color_vino: string;
  stock: number;
  capacidad: number;
  wine_details: Winedetails;
}

export interface Winedetails {
  bodega: string;
  id_vino: string;
  id_detalle: string;
  notas_cata: string;
  tipo_crianza: string;
  contenido_azucar: string;
  contenido_carbonico: string;
}

export interface Consumibles {
  id: string;
  nombre: string;
  url_imagen: string;
  descripcion: string;
  precio: number;
}

export interface CartItem {
  id: string
  quantity: number
}

export interface CartItemWithWine extends Wine {
  quantity: number
}

export interface User {
  id: string
  email: string
  password: string
  name: string
  isAdmin: boolean
}

export interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (email: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isProcessingMagicLink: boolean
  updateUserRole: (userId: string, isAdmin: boolean) => Promise<void>
}

export interface FilterState {
  selectedVariedades: string[]
  selectedBodegas: string[]
  selectedPaises: string[]
  selectedColores: string[]
  priceRange: {
    min: number
    max: number
  }
}


export interface WineTableProps {
  wines?: Wine[];
  onWinesChange?: (wines: Wine[]) => void;
  className?: string;
}