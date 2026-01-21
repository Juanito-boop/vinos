import { Wine as WineIcon } from "lucide-react"

interface EmptyStateProps {
  searchTerm: string
  totalWines: number
}

export function EmptyState({ searchTerm, totalWines }: EmptyStateProps) {
	return (
		<div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-red-100">
			<WineIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
			<h3 className="text-lg font-medium text-gray-900 mb-2">
				{searchTerm ? "No se encontraron vinos" : "No hay vinos en el inventario"}
			</h3>
			<p className="text-gray-500">
				{searchTerm
					? `No hay vinos que coincidan con "${searchTerm}"`
					: "Importa un archivo Excel para comenzar"
				}
			</p>
		</div>
	)
}
