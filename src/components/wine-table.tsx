"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import * as XLSX from "xlsx"
import { Download, Upload, Wine as WineIcon, SquarePen, Trash2, Plus, Palette, Grape, MapPin, Icon, DollarSign, StickyNote, Clock, Percent, Search } from "lucide-react"
import { wineGlassBottle } from '@lucide/lab'
import { Button } from "./ui/button"
import { Wine } from "@/types"
import { toast } from "sonner"
import { WineService } from "@/lib/services/wine-service"
import EditWineModal from "./modales/edit-wine-modal"
import { Input } from "./ui/input"
import DeleteWineModal from "./modales/delete-wine-modal"
import { useWineRealtime } from "@/hooks/useRealtimeWines"

interface WineTableProps {
  wines?: any[]
  onWinesChange?: (wines: any[]) => void
  className?: string
}

const WineTable: React.FC<WineTableProps> = ({ wines: externalWines, onWinesChange, className = "" }) => {
  const { wines: realtimeWines, isLoading, error } = useWineRealtime();
  const [searchTerm, setSearchTerm] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const winesToDisplay = externalWines || realtimeWines

  // Filtrar vinos por término de búsqueda
  const filteredWines = winesToDisplay.filter((wine) =>
    wine.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const loadWines = async () => {
      try {
        const winesData = await WineService.getAllWines()
        // No necesitamos setear internalWines aquí, ya que useWineRealtime lo maneja
      } catch (error) {
        console.error('Error loading wines:', error)
        // setInternalWines([]) // This line was removed as per the new_code
      }
    }

    if (!externalWines) {
      loadWines()
    }
  }, [externalWines]) // Mantener solo si externalWines se usa para algo más que la carga inicial que ahora hace realtime

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
        anada: w.anada,
        bodega: w.wine_details.bodega,
        "id detalle": w.wine_details.id_detalle,
        "notas cata": w.wine_details.notas_cata,
        "tipo crianza": w.wine_details.tipo_crianza,
        "contenido azucar": w.wine_details.contenido_azucar,
        "contenido carbonico": w.wine_details.contenido_carbonico,
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
          onClick: () => console.log("cerrar"),
        },
      })
    } catch (error) {
      toast.error("Error al exportar el inventario", {
        description: "Por favor, intenta nuevamente más tarde.",
        action: {
          label: "cerrar",
          onClick: () => console.log("cerrar"),
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
          tipo_crianza: row["tipo crianza"] || row.tipo_crianza,
          contenido_azucar: row["contenido azucar"] || row.contenido_azucar,
          contenido_carbonico: row["contenido carbonico"] || row.contenido_carbonico,
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
            onClick: () => console.log("cerrar"),
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
          onClick: () => console.log("cerrar"),
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
          onClick: () => console.log("cerrar"),
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

  const getColorBadge = (color: string) => {
    const colorClasses = {
      Tinto: "bg-red-100 text-red-800 border-red-200",
      Blanco: "bg-amber-100 text-amber-800 border-amber-200",
      Rosé: "bg-pink-100 text-pink-800 border-pink-200",
      Espumoso: "bg-blue-100 text-blue-800 border-blue-200",
    }

    return colorClasses[color as keyof typeof colorClasses] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className={`relative ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-6 pt-0">
        <div className="flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-xl">
            <WineIcon className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-red-900">Administración de Productos</h2>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
          >
            <Plus className="h-4 w-4" />
            Agregar Vino
          </Button>
          <Button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
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
      <div className="px-6 pb-4">
        <div className="relative max-w-xl">
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
            <thead className="bg-gradient-to-r from-red-600 to-red-700 text-white">
              <tr>
                {/* Sticky First Column */}
                <th className="sticky left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider border-r border-red-500 w-80 min-w-72 max-w-96 shadow-lg">
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
                <th className="sticky right-0 z-30 bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider border-l border-red-500 w-32 min-w-32 max-w-32 shadow-lg">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredWines.map((wine: Wine, index) => (
                <tr key={wine.id_vino} className="hover:bg-red-50 bg-white">
                  {/* Sticky First Column */}
                  <td className={`sticky left-0 z-20 px-6 py-4 border-r border-gray-200 w-72 min-w-72 max-w-72 bg-white shadow-lg`}>
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
                          {wine.pais_importacion}
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
                  <td className={`sticky right-0 z-20 px-6 py-4 border-l border-gray-200 w-32 min-w-32 max-w-32 shadow-lg ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-center gap-2 w-full">
                      <EditWineModal vino={wine}>
                        <div className="bg-blue-600 hover:bg-blue-700 text-white p-2 h-8 w-8 rounded-md flex items-center justify-center cursor-pointer transition-colors">
                          <SquarePen size={14} />
                        </div>
                      </EditWineModal>
                      <DeleteWineModal vino={wine}>
                        <div className="bg-red-600 hover:bg-red-700 text-white p-2 h-8 w-8 rounded-md flex items-center justify-center cursor-pointer transition-colors">
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

      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-red-100">
          <WineIcon className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando vinos...</h3>
          <p className="text-gray-500">Por favor espera mientras cargamos el inventario.</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-red-100">
          <WineIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar vinos</h3>
          <p className="text-gray-500">{error.message}</p>
        </div>
      ) : filteredWines.length === 0 && (
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

export default WineTable
