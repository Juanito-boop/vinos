import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface WineSearchProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onClear: () => void
  totalWines: number
  filteredCount: number
}

export function WineSearch({
  searchTerm,
  onSearchChange,
  onClear,
  totalWines,
  filteredCount
}: WineSearchProps) {
  return (
    <div className="px-6 pb-4 flex flex-col items-center">
      <div className="relative max-w-xl w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Buscar vino por nombre..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {searchTerm && (
          <button
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <span className="text-lg">×</span>
          </button>
        )}
      </div>
      {searchTerm && (
        <p className="text-sm text-gray-600 mt-2">
          Mostrando {filteredCount} de {totalWines} vinos
        </p>
      )}
    </div>
  )
}
