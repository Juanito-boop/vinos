import { Wine } from "@/types"

export function mapWinesToExcel(wines: Wine[]) {
  return wines.map((w) => ({
    "id vino": w.id_vino,
    stock: w.stock,
    nombre: w.nombre,
    precio: w.precio,
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
}

export function mapExcelToWines(json: any[]): Wine[] {
  return json.map((row: any) => ({
    id_vino: row["id vino"] || row.id_vino || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    stock: Number(row.stock) || 0,
    nombre: row.nombre,
    precio: Number(row.precio),
    descripcion: row.descripcion,
    nivel_alcohol: Number(row["nivel alcohol"] || row.nivel_alcohol),
    variedades: row.variedades?.split(",").map((v: string) => v.trim()) ?? [],
    pais_importacion: row["pais importacion"] || row.pais_importacion,
    color_vino: row["color vino"] || row.color_vino,
    anada: Number(row.anada),
    url_imagen: row.url_imagen || "",
    capacidad: Number(row.capacidad) || 0,
    wine_details: {
      bodega: row.bodega,
      id_vino: row["id vino"] || row.id_vino || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      id_detalle: row["id detalle"] || row.id_detalle || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      notas_cata: row["notas cata"] || row.notas_cata,
      tipo_crianza: row["tipo crianza"] || row.tipo_crianza
    },
  }))
}
