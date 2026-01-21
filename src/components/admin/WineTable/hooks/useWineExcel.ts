import { useRef } from "react"
import * as XLSX from "xlsx"
import { Wine } from "@/types"
import { toast } from "sonner"
import { mapWinesToExcel, mapExcelToWines } from "../utils/excelMappers"

export function useWineExcel(wines: Wine[], onWinesChange?: (wines: Wine[]) => void) {
  const inputRef = useRef<HTMLInputElement>(null)

  const exportToExcel = () => {
    try {
      const flatData = mapWinesToExcel(wines)
      const ws = XLSX.utils.json_to_sheet(flatData)

      // Get data range
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1")

      // Configure protection for all cells (initially unlocked)
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (!ws[cellAddress]) continue

          // Unlock all cells by default
          if (!ws[cellAddress].s) ws[cellAddress].s = {}
          ws[cellAddress].s.protection = { locked: false }
        }
      }

      // Lock specifically the "id vino" (column A) and "id detalle" (column L) columns
      const protectedColumns = [0, 11] // Column A (id vino) and column L (id detalle)

      for (let row = range.s.r; row <= range.e.r; row++) {
        protectedColumns.forEach((col) => {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (ws[cellAddress]) {
            if (!ws[cellAddress].s) ws[cellAddress].s = {}
            ws[cellAddress].s.protection = { locked: true }

            // Add background color to indicate it's locked
            ws[cellAddress].s.fill = {
              fgColor: { rgb: "FFE6E6" },
              bgColor: { rgb: "FFE6E6" },
            }
          }
        })
      }

      // Configure worksheet protection
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

      toast.success("Inventario exportado exitosamente", {
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

      const imported = mapExcelToWines(json)

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
        toast.error("Error al importar el inventario", {
          description: "Error en el archivo: verifica que los campos numéricos sean correctos.",
          action: {
            label: "cerrar",
            onClick: () => ""
          },
        })
        return
      }

      if (onWinesChange) {
        onWinesChange(imported)
      }

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
      toast.error("Error al importar el inventario", {
        description: "Error al procesar el archivo Excel.",
        action: {
          label: "cerrar",
          onClick: () => ""
        },
      })
    }
  }

  return {
    inputRef,
    exportToExcel,
    handleImport,
  }
}
