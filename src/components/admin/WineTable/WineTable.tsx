"use client"

import { Wine } from "@/types"
import { useWineSearch } from "./hooks/useWineSearch"
import { useWinePagination } from "./hooks/useWinePagination"
import { useWineExcel } from "./hooks/useWineExcel"
import { WineTableHeader } from "./components/WineTableHeader"
import { WineSearch } from "./components/WineSearch"
import { WineTableBody } from "./components/WineTableBody"
import { WinePagination } from "./components/WinePagination"
import { EmptyState } from "./components/EmptyState"
import { RefObject } from "react"

interface WineTableProps {
  wines?: Wine[]
  onWinesChange?: (wines: Wine[]) => void
  className?: string
}

export function WineTable({ wines = [], onWinesChange, className }: WineTableProps) {
  // Search functionality
  const {
    searchTerm,
    setSearchTerm,
    clearSearch,
    filteredWines
  } = useWineSearch(wines)

  // Pagination functionality
  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    getPageNumbers,
    hasNextPage,
    hasPrevPage,
  } = useWinePagination({
    totalItems: filteredWines.length,
    itemsPerPage: 10
  })

  // Excel import/export functionality
  const { inputRef, exportToExcel, handleImport } = useWineExcel(wines, onWinesChange)

  // Get current page wines
  const currentWines = filteredWines.slice(startIndex, endIndex)
  const pageNumbers = getPageNumbers()

  const handleWineCreated = (newWine: Wine) => {
    onWinesChange?.([newWine, ...wines])
  }

  return (
    <div className={`relative ${className}`}>
      {/* Header with controls */}
      <WineTableHeader
        onExport={exportToExcel}
        onImport={handleImport}
        inputRef={inputRef as RefObject<HTMLInputElement>}
        onWineCreated={handleWineCreated}
      />

      {/* Search Bar */}
      <WineSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={clearSearch}
        totalWines={wines.length}
        filteredCount={filteredWines.length}
      />

      {/* Table */}
      {currentWines.length > 0 ? (
        <>
          <WineTableBody wines={currentWines} />

          {/* Pagination */}
          <WinePagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredWines.length}
            pageNumbers={pageNumbers}
            onPageChange={goToPage}
            onNext={nextPage}
            onPrev={prevPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
          />
        </>
      ) : (
        <EmptyState searchTerm={searchTerm} totalWines={wines.length} />
      )}
    </div>
  )
}
