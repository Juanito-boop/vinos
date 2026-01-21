import { useState, useEffect } from "react"

interface UseWinePaginationProps {
  totalItems: number
  itemsPerPage?: number
}

export function useWinePagination({ totalItems, itemsPerPage = 10 }: UseWinePaginationProps) {
	const [currentPage, setCurrentPage] = useState(1)
  
	const totalPages = Math.ceil(totalItems / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const endIndex = startIndex + itemsPerPage

	// Reset to first page when total items change
	useEffect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(1)
		}
	}, [totalItems, currentPage, totalPages])

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page)
		}
	}

	const nextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1)
		}
	}

	const prevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1)
		}
	}

	const getPageNumbers = () => {
		const pages: (number | 'ellipsis')[] = []
		const maxVisiblePages = 5

		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i)
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) {
					pages.push(i)
				}
				pages.push('ellipsis')
				pages.push(totalPages)
			} else if (currentPage >= totalPages - 2) {
				pages.push(1)
				pages.push('ellipsis')
				for (let i = totalPages - 3; i <= totalPages; i++) {
					pages.push(i)
				}
			} else {
				pages.push(1)
				pages.push('ellipsis')
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i)
				}
				pages.push('ellipsis')
				pages.push(totalPages)
			}
		}

		return pages
	}

	return {
		currentPage,
		totalPages,
		startIndex,
		endIndex,
		goToPage,
		nextPage,
		prevPage,
		getPageNumbers,
		hasNextPage: currentPage < totalPages,
		hasPrevPage: currentPage > 1,
	}
}
