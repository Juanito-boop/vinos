import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WinePaginationProps {
  currentPage: number
  totalPages: number
  startIndex: number
  endIndex: number
  totalItems: number
  pageNumbers: (number | 'ellipsis')[]
  onPageChange: (page: number) => void
  onNext: () => void
  onPrev: () => void
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function WinePagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  pageNumbers,
  onPageChange,
  onNext,
  onPrev,
  hasNextPage,
  hasPrevPage,
}: WinePaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200 mt-2 rounded-2xl">
      <div className="text-sm text-gray-700">
        Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} vinos
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!hasPrevPage}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            <div key={index}>
              {page === 'ellipsis' ? (
                <span className="flex h-9 w-9 items-center justify-center text-sm text-gray-500">
                  ...
                </span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  className={`h-9 w-9 p-0 font-bold ${currentPage === page
                      ? 'bg-primary hover:bg-primary/90'
                      : 'border-primary/10 text-primary hover:bg-primary/5'
                    }`}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNextPage}
          className="flex items-center gap-1"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
