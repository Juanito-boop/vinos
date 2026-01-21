import { useRef } from "react"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { toast } from "sonner"
import { Wine } from "@/types"
import { mapExcelToWines } from "../utils/excelMappers"

export function useWineExcel(
	wines: Wine[],
	onWinesChange?: (wines: Wine[]) => void
) {
	const inputRef = useRef<HTMLInputElement>(null)

	/* =======================
     EXPORTAR A EXCEL
     ======================= */
	const exportToExcel = async () => {
		try {
			const workbook = new ExcelJS.Workbook()
			const sheet = workbook.addWorksheet("Vinos")

			/* ---------- Columnas ---------- */
			sheet.columns = [
				{ header: "id_vino", key: "id_vino", width: 20 },
				{ header: "id_detalle", key: "id_detalle", width: 20 },

				{ header: "nombre", key: "nombre", width: 20 },
				{ header: "precio", key: "precio", width: 15 },
				{ header: "descripcion", key: "descripcion", width: 30 },
				{ header: "nivel_alcohol", key: "nivel_alcohol", width: 15 },
				{ header: "variedades", key: "variedades", width: 25 },
				{ header: "pais_importacion", key: "pais_importacion", width: 20 },
				{ header: "color_vino", key: "color_vino", width: 15 },
				{ header: "stock", key: "stock", width: 10 },
				{ header: "capacidad", key: "capacidad", width: 15 },
				{ header: "bodega", key: "bodega", width: 20 },
				{ header: "notas_cata", key: "notas_cata", width: 30 },
				{ header: "tipo_crianza", key: "tipo_crianza", width: 20 },
			]

			/* ---------- Filas ---------- */
			wines.forEach((w) => {
				sheet.addRow([
					w.id_vino,
					w.wine_details.id_detalle,
					w.nombre,
					w.precio,
					w.descripcion,
					w.nivel_alcohol,
					w.variedades.join(", "),
					w.pais_importacion,
					w.color_vino,
					w.stock,
					w.capacidad,
					w.wine_details.bodega,
					w.wine_details.notas_cata,
					w.wine_details.tipo_crianza,
				])
			})

			/* ---------- Desbloquear todo ---------- */
			sheet.eachRow({ includeEmpty: true }, (row) => {
				row.eachCell({ includeEmpty: true }, (cell) => {
					cell.protection = { locked: false }
				})
			})

			/* ---------- Bloquear + ocultar A y B ---------- */
			;[1, 2].forEach((colIndex) => {
				const col = sheet.getColumn(colIndex)
				col.hidden = true

				col.eachCell({ includeEmpty: true }, (cell) => {
					cell.protection = { locked: true }
				})
			})

			/* ---------- Congelar columnas (A,B,C) y encabezado ---------- */
			sheet.views = [
				{
					state: "frozen",
					xSplit: 3, // A, B, C
					ySplit: 1, // header
				},
			]

			/* ------------------- Auto-ajustar columnas ------------------- */
			const autoFitColumns = (sheet: ExcelJS.Worksheet, columns: number[]) => {
				columns.forEach((colIndex) => {
					const column = sheet.getColumn(colIndex)

					let maxLength =
            column.header ? String(column.header).length : 10

					column.eachCell({ includeEmpty: true }, (cell) => {
						if (cell.value) {
							const length = String(cell.value).length
							if (length > maxLength) {
								maxLength = length
							}
						}
					})

					column.width = Math.min(maxLength + 2, 45)
				})
			}

			autoFitColumns(sheet, [3, 7, 9, 12])

			/* ---------- Crear tabla ---------- */
			sheet.addTable({
				name: "TablaVinos",
				ref: "A1",
				headerRow: true,
				totalsRow: false,
				style: {
					theme: "TableStyleMedium9",
					showRowStripes: true,
				},
				columns: sheet.columns.map((c) => ({
					name: String(c.header),
				})),
				rows: wines.map((w) => [
					w.id_vino,
					w.wine_details.id_detalle,
					w.nombre,
					w.precio,
					w.descripcion,
					w.nivel_alcohol,
					w.variedades.join(", "),
					w.pais_importacion,
					w.color_vino,
					w.stock,
					w.capacidad,
					w.wine_details.bodega,
					w.wine_details.notas_cata,
					w.wine_details.tipo_crianza,
				]),
			})

			/* ---------- Proteger hoja ---------- */
			await sheet.protect("admin123", {
				selectLockedCells: false,
				selectUnlockedCells: true,
				autoFilter: true,
				sort: true,
				insertRows: true,
				deleteRows: true,
			})

			/* ---------- Descargar ---------- */
			const buffer = await workbook.xlsx.writeBuffer()
			saveAs(new Blob([buffer]), "inventario_vinos.xlsx")

			toast.success("Inventario exportado", {
				description: "IDs ocultos, bloqueados y nombre fijo",
			})
		} catch {
			toast.error("Error al exportar el inventario")
		}
	}

	/* =======================
     IMPORTAR DESDE EXCEL
     ======================= */
	const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		try {
			const buffer = await file.arrayBuffer()
			const workbook = new ExcelJS.Workbook()
			await workbook.xlsx.load(buffer)

			const sheet = workbook.worksheets[0]
			const headers = sheet.getRow(1).values as string[]

			const json = sheet
				.getRows(2, sheet.rowCount - 1)!
				.map((row) => {
					const obj: any = {}
					headers.forEach((h, i) => {
						if (!h) return
						obj[h] = row.getCell(i).value
					})
					return obj
				})

			/* ---------- Ignorar IDs ---------- */
			const sanitized = json.map(
				({ id_vino, id_detalle, ...rest }) => rest
			)

			const imported = mapExcelToWines(sanitized)

			const errores = imported.filter(
				(w) =>
					!w.nombre ||
          typeof w.stock !== "number" ||
          typeof w.precio !== "number" ||
          typeof w.nivel_alcohol !== "number" ||
          isNaN(w.stock) ||
          isNaN(w.precio) ||
          isNaN(w.nivel_alcohol)
			)

			if (errores.length > 0) {
				toast.error("Error al importar", {
					description: "Verifica los campos numéricos",
				})
				return
			}

			onWinesChange?.(imported)

			toast.success("Inventario importado", {
				description: `${imported.length} vinos cargados`,
			})

			if (inputRef.current) inputRef.current.value = ""
		} catch {
			toast.error("Error al procesar el archivo Excel")
		}
	}

	return {
		inputRef,
		exportToExcel,
		handleImport,
	}
}