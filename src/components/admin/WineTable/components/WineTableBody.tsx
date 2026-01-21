import { Wine } from "@/types"
import { WineRow } from "./WineRow"
import {
  Wine as WineIcon,
  Icon,
  DollarSign,
  Clock,
  Percent,
  Palette,
  Grape,
  MapPin,
  StickyNote
} from "lucide-react"
import { wineGlassBottle } from '@lucide/lab'

interface WineTableBodyProps {
  wines: Wine[]
}

export function WineTableBody({ wines }: WineTableBodyProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary text-white">
            <tr>
              <th className="sticky bg-primary left-0 z-30 px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] border-r border-white/5 w-80 min-w-72 max-w-96">
                <div className="flex items-center gap-2">
                  <WineIcon size={16} />
                  Vino
                </div>
              </th>

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

              <th className="sticky bg-primary right-0 z-30 px-6 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] border-l border-white/5 w-32 min-w-32 max-w-32">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {wines.map((wine, index) => (
              <WineRow key={wine.id_vino} wine={wine} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
