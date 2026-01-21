import { Download, Upload, Wine as WineIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import AddWineModal from "@/components/admin/add-wine-modal"
import { Input } from "@/components/ui/input"
import { Wine } from "@/types"

interface WineTableHeaderProps {
  onExport: () => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  inputRef: React.RefObject<HTMLInputElement>
  onWineCreated?: (wine: Wine) => void
}

export function WineTableHeader({ onExport, onImport, inputRef, onWineCreated }: WineTableHeaderProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 p-6 pt-0">
      <div className="flex items-center gap-4">
        <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10">
          <WineIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tight">
            Administración de Vinos
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] uppercase tracking-widest font-black text-primary/40">
              Sincronizado en tiempo real
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
         <AddWineModal onWineCreated={onWineCreated}>
          <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-600/90 text-white px-6 h-12 rounded-xl font-bold transition-all shadow-lg shadow-green-600/10 transform hover:-translate-y-0.5 text-xs uppercase tracking-widest">
            <Plus className="h-4 w-4" />
            Agregar Vino
          </Button>
         </AddWineModal>

        <Button
          onClick={onExport}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 h-12 rounded-xl font-bold transition-all shadow-lg shadow-primary/10 transform hover:-translate-y-0.5 text-xs uppercase tracking-widest"
        >
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>

        <label className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer text-sm">
          <Upload className="h-4 w-4" />
          Importar Excel
          <Input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={onImport}
            className="hidden"
          />
        </label>
      </div>
    </div>
  )
}
