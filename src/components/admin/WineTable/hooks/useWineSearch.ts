import { useState, useMemo } from "react"
import { Wine } from "@/types"

export function useWineSearch(wines: Wine[]) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredWines = useMemo(() => {
    if (!searchTerm.trim()) return wines
    
    const lowerSearch = searchTerm.toLowerCase()
    return wines.filter((wine) =>
      wine.nombre.toLowerCase().includes(lowerSearch)
    )
  }, [wines, searchTerm])

  const clearSearch = () => setSearchTerm("")

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    filteredWines,
    hasSearch: searchTerm.trim().length > 0,
  }
}
