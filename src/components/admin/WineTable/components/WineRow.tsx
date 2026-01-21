import { Wine } from "@/types"
import { SquarePen, Trash2 } from "lucide-react"
import EditWineModal from "@/components/admin/edit-wine-modal"
import DeleteWineModal from "@/components/admin/delete-wine-modal"
import { formatPrice } from "../utils/formatPrice"
import { getColorBadge } from "../utils/getColorBadge"

interface WineRowProps {
  wine: Wine
  index: number
}

export function WineRow({ wine, index }: WineRowProps) {
  const rowBgClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50'

  return (
    <tr className={rowBgClass}>
      {/* Sticky First Column */}
      <td className={`sticky left-0 z-20 px-6 py-4 border-r border-gray-200 w-72 min-w-72 max-w-72 shadow-lg ${rowBgClass}`}>
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
      <td className={`sticky right-0 z-20 px-6 py-4 border-l border-gray-200 w-32 min-w-32 max-w-32 shadow-lg ${rowBgClass}`}>
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
  )
}
