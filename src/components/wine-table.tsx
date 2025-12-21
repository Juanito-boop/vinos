"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import * as XLSX from "xlsx"
import { Download, Upload, Wine as WineIcon, SquarePen, Trash2, Plus, Palette, Grape, MapPin, Icon, DollarSign, StickyNote, Clock, Percent, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { wineGlassBottle } from '@lucide/lab'
import { Button } from "./ui/button"
import { Wine } from "@/types"
import { toast } from "sonner"
import { WineService } from "@/lib/services/wine-service"
import EditWineModal from "./admin/edit-wine-modal"
import { Input } from "./ui/input"
import DeleteWineModal from "./admin/delete-wine-modal"

interface WineTableProps {
  wines?: Wine[]
  onWinesChange?: (wines: Wine[]) => void
  className?: string
}

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export function WineTable({ wines = [], onWinesChange, className }: WineTableProps) {
	const [internalWines, setInternalWines] = useState<Wine[]>([])
	const [sortConfig, setSortConfig] = useState<SortConfig>({
		key: 'nombre',
		direction: 'asc'
	})
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage] = useState(10)

	const [searchTerm, setSearchTerm] = useState("")
	const inputRef = useRef<HTMLInputElement>(null)

	const winesToDisplay = wines

	// Filtrar vinos por término de búsqueda
	const filteredWines = winesToDisplay.filter((wine) =>
		wine.nombre.toLowerCase().includes(searchTerm.toLowerCase())
	)

	// Calcular paginación
	const totalPages = Math.ceil(filteredWines.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const endIndex = startIndex + itemsPerPage
	const currentWines = filteredWines.slice(startIndex, endIndex)

	// Resetear a la primera página cuando cambie el término de búsqueda
	useEffect(() => {
		setCurrentPage(1)
	}, [searchTerm])

	const setWines = (newWines: any[]) => {
		if (onWinesChange) {
			onWinesChange(newWines)
		} else {
			// Esto ya no es necesario si siempre usamos realtimeWines
		}
	}

	const exportToExcel = () => {
		try {
			const flatData = winesToDisplay.map((w) => ({
				"id vino": w.id_vino,
				stock: w.stock,
				nombre: w.nombre,
				precio: w.precio,
				// "url imagen": w.url_imagen,
				descripcion: w.descripcion,
				"nivel alcohol": w.nivel_alcohol,
				variedades: w.variedades.join(", "),
				"pais importacion": w.pais_importacion,
				"color vino": w.color_vino,
				bodega: w.wine_details.bodega,
				"id detalle": w.wine_details.id_detalle,
				"notas cata": w.wine_details.notas_cata,
				"tipo crianza": w.wine_details.tipo_crianza
			}))

			const ws = XLSX.utils.json_to_sheet(flatData)

			// Obtener el rango de datos
			const range = XLSX.utils.decode_range(ws["!ref"] || "A1")

			// Configurar protección para todas las celdas (inicialmente desbloqueadas)
			for (let row = range.s.r; row <= range.e.r; row++) {
				for (let col = range.s.c; col <= range.e.c; col++) {
					const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
					if (!ws[cellAddress]) continue

					// Desbloquear todas las celdas por defecto
					if (!ws[cellAddress].s) ws[cellAddress].s = {}
					ws[cellAddress].s.protection = { locked: false }
				}
			}

			// Bloquear específicamente las columnas "id vino" (columna A) e "id detalle" (columna L)
			const protectedColumns = [0, 11] // Columna A (id vino) y columna L (id detalle)

			for (let row = range.s.r; row <= range.e.r; row++) {
				protectedColumns.forEach((col) => {
					const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
					if (ws[cellAddress]) {
						if (!ws[cellAddress].s) ws[cellAddress].s = {}
						ws[cellAddress].s.protection = { locked: true }

						// Agregar color de fondo para indicar que está bloqueada
						ws[cellAddress].s.fill = {
							fgColor: { rgb: "FFE6E6" }, // Color rojo claro
							bgColor: { rgb: "FFE6E6" },
						}
					}
				})
			}

			// Configurar protección del worksheet
			ws["!protect"] = {
				password: "admin123",
				selectLockedCells: true,
				selectUnlockedCells: true,
				formatCells: false,
				formatColumns: false,
				formatRows: false,
				insertColumns: false,
				insertRows: false,
				insertHyperlinks: false,
				deleteColumns: false,
				deleteRows: false,
				sort: false,
				autoFilter: false,
				pivotTables: false,
			}

			const wb = XLSX.utils.book_new()
			XLSX.utils.book_append_sheet(wb, ws, "Vinos")
			XLSX.writeFile(wb, "inventario_vinos.xlsx")

			toast.success(
				"Inventario exportado exitosamente", {
					description: "Las columnas ID están protegidas contra edición",
					action: {
						label: "cerrar",
						onClick: () => "",
					},
				})
		} catch (error) {
			toast.error("Error al exportar el inventario", {
				description: "Por favor, intenta nuevamente más tarde.",
				action: {
					label: "cerrar",
					onClick: () => "",
				},
			})
		}
	}

	const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		try {
			const data = await file.arrayBuffer()
			const workbook = XLSX.read(data, { type: "array" })
			const sheet = workbook.Sheets[workbook.SheetNames[0]]
			const json = XLSX.utils.sheet_to_json<any>(sheet)

			const imported: any[] = json.map((row: any) => ({
				id_vino: row["id vino"] || row.id_vino || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				stock: Number(row.stock) || 0,
				nombre: row.nombre,
				precio: Number(row.precio),
				// url_imagen: row["url imagen"] || row.url_imagen || "",
				descripcion: row.descripcion,
				nivel_alcohol: Number(row["nivel alcohol"] || row.nivel_alcohol),
				variedades: row.variedades?.split(",").map((v: string) => v.trim()) ?? [],
				pais_importacion: row["pais importacion"] || row.pais_importacion,
				color_vino: row["color vino"] || row.color_vino,
				anada: Number(row.anada),
				wine_details: {
					bodega: row.bodega,
					id_vino: row["id vino"] || row.id_vino || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					id_detalle: row["id detalle"] || row.id_detalle || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					notas_cata: row["notas cata"] || row.notas_cata,
					tipo_crianza: row["tipo crianza"] || row.tipo_crianza
				},
			}))

			const errores = imported.filter(
				(w) =>
					!w.nombre ||
          typeof w.stock !== "number" ||
          typeof w.precio !== "number" ||
          typeof w.nivel_alcohol !== "number" ||
          isNaN(w.stock) ||
          isNaN(w.precio) ||
          isNaN(w.nivel_alcohol),
			)

			if (errores.length > 0) {
				// showNotification("error", "Error en el archivo: verifica que los campos numéricos sean correctos")
				toast.error("Error al importar el inventario", {
					description: "Error en el archivo: verifica que los campos numéricos sean correctos.",
					action: {
						label: "cerrar",
						onClick: () => ""
					},
				})
				return
			}

			setWines(imported)
			// showNotification("success", `${imported.length} vinos importados exitosamente`)
			toast.success("Inventario", {
				description: `${imported.length} vinos importados exitosamente`,
				action: {
					label: "cerrar",
					onClick: () => ""
				},
			})

			// Reset file input
			if (inputRef.current) {
				inputRef.current.value = ""
			}
		} catch (error) {
			// showNotification("error", "Error al procesar el archivo Excel")
			toast.error("Error al exportar el inventario", {
				description: "Error al procesar el archivo Excel.",
				action: {
					label: "cerrar",
					onClick: () => ""
				},
			})
		}
	}

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("es-CO", {
			style: "currency",
			currency: "COP",
			minimumFractionDigits: 0,
		}).format(price)
	}

	// Función para generar números de página
	const getPageNumbers = () => {
		const pages = []
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

	const getColorBadge = (color: string) => {
		const colorClasses = {
			Tinto: "bg-red-100 text-red-800 border-red-200",
			Blanco: "bg-amber-100 text-amber-800 border-amber-200",
			Rosé: "bg-pink-100 text-pink-800 border-pink-200",
			Espumoso: "bg-blue-100 text-blue-800 border-blue-200",
		}

		return colorClasses[color as keyof typeof colorClasses] || "bg-gray-100 text-gray-800 border-gray-200"
	}

	useEffect(() => {
		if (typeof window !== "undefined" && totalPages > 0) {
			const url = new URL(window.location.href);
			const pageParam = url.searchParams.get("page");
			const page = pageParam ? parseInt(pageParam) : 1;
			if (!isNaN(page) && page > 0 && page <= totalPages) {
				setCurrentPage(page);
			}
		}
	}, [totalPages]);

	return (
		<div className={`relative ${className}`}>
			{/* Header with controls */}
			<div className="flex items-center justify-between flex-wrap gap-4 p-6 pt-0">
				<div className="flex items-center gap-4">
					<div className="bg-primary/5 p-3 rounded-2xl border border-primary/10">
						<WineIcon className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h2 className="text-3xl font-black text-primary tracking-tight">Administración de Vinos</h2>
						<div className="flex items-center gap-2 mt-1">
							<div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
							<span className="text-[10px] uppercase tracking-widest font-black text-primary/40">
                Sincronizado en tiempo real
							</span>
						</div>
					</div>
				</div>

				<div className="flex gap-3 flex-wrap">
					<Button
						className="flex items-center gap-2 bg-green-600 hover:bg-green-600/90 text-white px-6 h-12 rounded-xl font-bold transition-all shadow-lg shadow-green-600/10 transform hover:-translate-y-0.5 text-xs uppercase tracking-widest"
					>
						<Plus className="h-4 w-4" />
            Agregar Vino
					</Button>
					<Button
						onClick={exportToExcel}
						className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 h-12 rounded-xl font-bold transition-all shadow-lg shadow-primary/10 transform hover:-translate-y-0.5 text-xs uppercase tracking-widest"
					>
						<Download className="h-4 w-4" />
            Exportar Excel
					</Button>

					<label className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer text-sm">
						<Upload className="h-4 w-4" />
            Importar Excel
						<Input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
					</label>
				</div>
			</div>

			{/* Search Bar */}
			<div className="px-6 pb-4 flex justify-center">
				<div className="relative max-w-xl w-full">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search className="h-5 w-5 text-gray-400" />
					</div>
					<Input
						type="text"
						placeholder="Buscar vino por nombre..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0"
					/>
					{searchTerm && (
						<button
							onClick={() => setSearchTerm("")}
							className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
						>
							<span className="text-lg">×</span>
						</button>
					)}
				</div>
				{searchTerm && (
					<p className="text-sm text-gray-600 mt-2">
            Mostrando {filteredWines.length} de {winesToDisplay.length} vinos
					</p>
				)}
			</div>

			{/* Table */}
			<div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-primary text-white">
							<tr>
								{/* Sticky First Column */}
								<th className="sticky bg-primary left-0 z-30 px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] border-r border-white/5 w-80 min-w-72 max-w-96">
									<div className="flex items-center gap-2">
										<WineIcon size={16} />
                    Vino
									</div>
								</th>

								{/* Scrollable Middle Columns */}
								<th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
									<div className="flex items-center gap-2">
										<Icon size={16} iconNode={wineGlassBottle} />
                    Stock
									</div>
								</th>
								<th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
									<div className="flex items-center gap-2">
										<DollarSign size={16} />
                    Precio
									</div>
								</th>
								<th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
									<div className="flex items-center gap-2">
										<Clock size={16} />
                    Tiempo
									</div>
								</th>
								<th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
									<div className="flex items-center justify-center gap-2">
										<Percent size={16} />
                    Alcohol
									</div>
								</th>
								<th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
									<div className="flex items-center justify-center gap-2">
										<Palette size={16} />
                    Color
									</div>
								</th>
								<th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
									<div className="flex items-center justify-center gap-2">
										<Grape size={16} />
                    Variedades
									</div>
								</th>
								<th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap w-56 min-w-56">
									<div className="flex items-center justify-center gap-2">
										<MapPin size={16} />
                    Bodega
									</div>
								</th>
								<th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap w-auto min-w-56">
									<div className="flex items-center justify-center gap-2">
										<StickyNote size={16} />
                    Notas de Cata
									</div>
								</th>
								<th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
									<div className="flex items-center justify-center gap-2">
										<StickyNote size={16} />
                    Capacidad
									</div>
								</th>

								{/* Sticky Last Column */}
								<th className="sticky bg-primary right-0 z-30 px-6 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] border-l border-white/5 w-32 min-w-32 max-w-32">
                  Acciones
								</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-100">
							{currentWines.map((wine: Wine, index) => (
								<tr key={wine.id_vino} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
									{/* Sticky First Column */}
									<td className={`sticky left-0 z-20 px-6 py-4 border-r border-gray-200 w-72 min-w-72 max-w-72 shadow-lg ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
										<div className="flex items-center gap-4">
											{wine.url_imagen && (
												<img
													src={wine.url_imagen}
													alt={wine.nombre}
													className="w-16 h-16 rounded-lg object-cover shadow-sm border border-gray-200 flex-shrink-0"
												/>
											)}
											<div className="min-w-0 flex-1">
												<div className="font-semibold text-gray-900 text-sm leading-tight truncate">
													{wine.nombre}
												</div>
												<div className="text-sm text-gray-500 mt-1 truncate">
													{wine.pais_importacion} • {wine.variedades.length > 0 ? wine.variedades.join(', ') : ''}
												</div>
											</div>
										</div>
									</td>

									{/* Scrollable Middle Columns */}
									<td className="px-6 py-4 text-center">
										<span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${wine.stock > 20 ? 'bg-green-100 text-green-800' :
											wine.stock > 10 ? 'bg-yellow-100 text-yellow-800' :
												'bg-red-100 text-red-800'
										}`}>
											{wine.stock} unidades
										</span>
									</td>
									<td className="px-6 py-4 text-start">
										<span className="font-semibold text-gray-900 text-lg">
											{formatPrice(wine.precio)}
										</span>
									</td>
									<td className="px-6 py-4 text-center">
										<span className="font-semibold text-gray-900 text-lg">
											{wine.wine_details.tipo_crianza}
										</span>
									</td>
									<td className="px-6 py-4 text-center">
										<span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
											{wine.nivel_alcohol}%
										</span>
									</td>
									<td className="px-6 py-4 text-center">
										<span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getColorBadge(wine.color_vino)}`}>
											{wine.color_vino}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex flex-wrap gap-1 justify-center">
											{wine.variedades.map((variedad: string, idx: number) => (
												<span
													key={idx}
													className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap"
												>
													{variedad}
												</span>
											))}
										</div>
									</td>
									<td className="px-6 py-4 text-center">
										{wine.wine_details.bodega}
									</td>
									<td className="px-6 py-4">
										<p className="text-gray-600 text-sm leading-relaxed">
											{wine.wine_details.notas_cata}
										</p>
									</td>
									<td className="px-6 py-4 text-center">
										<span className="font-semibold text-gray-900 text-lg">
											{wine.capacidad}
										</span>
									</td>

									{/* Sticky Last Column */}
									<td className={`sticky right-0 z-20 px-6 py-4 border-l border-gray-200 w-32 min-w-32 max-w-32 shadow-lg  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
										<div className="flex items-center justify-center gap-2 w-full">
											<EditWineModal vino={wine}>
												<div className="bg-primary/10 hover:bg-primary hover:text-white text-primary p-2 h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-all border border-primary/20">
													<SquarePen size={14} />
												</div>
											</EditWineModal>
											<DeleteWineModal vino={wine}>
												<div className="bg-destructive/10 hover:bg-destructive hover:text-white text-destructive p-2 h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-all border border-destructive/20">
													<Trash2 size={14} />
												</div>
											</DeleteWineModal>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Paginación */}
			{filteredWines.length > 0 && totalPages > 1 && (
				<div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200 mt-2 rounded-2xl">
					<div className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredWines.length)} de {filteredWines.length} vinos
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
							className="flex items-center gap-1"
						>
							<ChevronLeft className="h-4 w-4" />
              Anterior
						</Button>

						<div className="flex items-center gap-1">
							{getPageNumbers().map((page, index) => (
								<div key={index}>
									{page === 'ellipsis' ? (
										<span className="flex h-9 w-9 items-center justify-center text-sm text-gray-500">
                      ...
										</span>
									) : (
										<Button
											variant={currentPage === page ? "default" : "outline"}
											className={`h-9 w-9 p-0 font-bold ${currentPage === page ? 'bg-primary hover:bg-primary/90' : 'border-primary/10 text-primary hover:bg-primary/5'}`}
											size="sm"
											onClick={() => setCurrentPage(page as number)}
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
							onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
							disabled={currentPage === totalPages}
							className="flex items-center gap-1"
						>
              Siguiente
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			{filteredWines.length === 0 && (
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
			)}
		</div>
	)
}
