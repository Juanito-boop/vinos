"use client"

import { useState, useRef } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import MultipleSelector, { Option } from "@/components/ui/multiple-selector"
import { useToast } from "@/hooks/use-toast"
import { Wine } from "@/types"

const TODAS_VARIEDADES = {
  "Vino Tinto": ["Carmenere"],
  "Vino Blanco": [],
  "Vino Rosé": ["Syrah Rosé"],
  "Vino Espumoso": [],
  "Ecológico": [],
}

const VARIEDADES_OPTIONS: Option[] = Object.entries(TODAS_VARIEDADES)
  .flatMap(([categoria, variedades]) =>
    variedades.map(variedad => ({
      value: variedad,
      label: variedad,
      categoria,
    }))
  )

function VariedadesSelector({ onVariedadesChange }: { onVariedadesChange: (v: string[]) => void }) {
  const [selected, setSelected] = useState<Option[]>([])

  const handleChange = (options: Option[]) => {
    setSelected(options)
    onVariedadesChange(options.map(o => o.value))
  }

  return (
    <div className="space-y-2">
      <Label>Variedades</Label>
      <MultipleSelector
        className="w-full"
        value={selected}
        onChange={handleChange}
        options={VARIEDADES_OPTIONS}
        placeholder="Seleccionar variedades..."
        hideClearAllButton
      />
      {selected.map((v, i) => (
        <input key={i} type="hidden" name="variedades" value={v.value} />
      ))}
    </div>
  )
}

export default function AddWineModal({
  children,
  onWineCreated,
}: {
  children: React.ReactNode
  onWineCreated?: (wine: Wine) => void
}) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    precio: 0,
    url_imagen: "",
    descripcion: "",
    nivel_alcohol: "",
    variedades: [] as string[],
    pais_importacion: "",
    color_vino: "",
    stock: 0,
    capacidad: 750,
    bodega: "",
    notas_cata: "",
    tipo_crianza: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona solo archivos de imagen")
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = e => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const checkBucketConnection = async () => {
    try {
      const { error } = await supabase.storage.from("images").list("")
      return !error
    } catch {
      return false
    }
  }

  const uploadImageToStorage = async (file: File): Promise<string> => {
    const bucketOk = await checkBucketConnection()
    if (!bucketOk) throw new Error("No se puede conectar con el bucket de imágenes")

    const ext = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
    const { error: uploadError } = await supabase.storage.from("images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })
    if (uploadError) throw uploadError

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("images")
      .createSignedUrl(fileName, 60 * 60 * 24 * 365)
    if (signedUrlError || !signedUrlData?.signedUrl) throw signedUrlError || new Error("No se pudo obtener URL")
    return signedUrlData.signedUrl
  }

  async function handleCreate(form: FormData) {
    setIsUploading(true)
    try {
      let finalImageUrl = formData.url_imagen
      if (selectedImage) {
        finalImageUrl = await uploadImageToStorage(selectedImage)
      }

      const variedades = form.getAll("variedades").map(v => String(v))
      const newWineData = {
        nombre: String(form.get("nombre")),
        precio: Number(form.get("precio")),
        url_imagen: finalImageUrl || "",
        descripcion: String(form.get("descripcion") || ""),
        nivel_alcohol: Number(form.get("nivel_alcohol") || 0),
        variedades,
        pais_importacion: String(form.get("pais_importacion") || ""),
        color_vino: String(form.get("color_vino") || ""),
        stock: Number(form.get("stock") || 0),
        capacidad: Number(form.get("capacidad") || 0),
      }

      const { data: winesData, error: winesError } = await supabase
        .from("wines")
        .insert(newWineData)
        .select()
        .single()
      if (winesError || !winesData) throw winesError || new Error("No se pudo crear el vino")

      const detailsData = {
        id_vino: winesData.id_vino,
        bodega: String(form.get("bodega") || ""),
        notas_cata: String(form.get("notas_cata") || ""),
        tipo_crianza: String(form.get("tipo_crianza") || ""),
      }

      const { data: wineDetailsData, error: wineDetailsError } = await supabase
        .from("wine_details")
        .insert(detailsData)
        .select()
        .single()
      if (wineDetailsError) throw wineDetailsError

      const newWine: Wine = {
        ...winesData,
        wine_details: wineDetailsData ?? {
          bodega: detailsData.bodega,
          notas_cata: detailsData.notas_cata,
          tipo_crianza: detailsData.tipo_crianza,
        },
      }

      toast({
        title: "¡Vino creado!",
        description: `${newWine.nombre} agregado correctamente.`,
      })

      setOpen(false)
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""

      onWineCreated?.(newWine)
    } catch (error) {
      console.error("Error al crear vino:", error)
      toast({
        title: "Error al crear",
        description: "No se pudo crear el vino. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Vino</DialogTitle>
        </DialogHeader>

        <form action={handleCreate} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input
                name="nombre"
                value={formData.nombre}
                onChange={e => handleFieldChange("nombre", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Precio</Label>
              <Input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={e => handleFieldChange("precio", parseFloat(e.target.value || "0"))}
                required
              />
            </div>

            <div>
              <Label>Alcohol (%)</Label>
              <Input
                type="number"
                name="nivel_alcohol"
                value={formData.nivel_alcohol}
                onChange={e => handleFieldChange("nivel_alcohol", e.target.value)}
                step="0.01"
                min="0"
                max="100"
              />
            </div>

            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={e => handleFieldChange("stock", parseInt(e.target.value || "0"))}
              />
            </div>

            <div>
              <Label>Color</Label>
              <Select value={formData.color_vino} onValueChange={v => handleFieldChange("color_vino", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el color del Vino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tinto">Tinto</SelectItem>
                  <SelectItem value="Blanco">Blanco</SelectItem>
                  <SelectItem value="Rosado">Rosado</SelectItem>
                  <SelectItem value="Espumante">Espumante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>País</Label>
              <Input
                name="pais_importacion"
                value={formData.pais_importacion}
                onChange={e => handleFieldChange("pais_importacion", e.target.value)}
              />
            </div>

            <div>
              <Label>Capacidad</Label>
              <Input
                name="capacidad"
                type="number"
                value={formData.capacidad}
                onChange={e => handleFieldChange("capacidad", parseFloat(e.target.value || "0"))}
              />
            </div>

            <div>
              <Label>Bodega</Label>
              <Input
                name="bodega"
                value={formData.bodega}
                onChange={e => handleFieldChange("bodega", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Imagen del Vino</Label>
            <div className="flex items-center gap-4 mb-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="flex-1"
              />
              {selectedImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Eliminar
                </Button>
              )}
            </div>

            <div className="flex justify-center">
              {imagePreview ? (
                <div
                  className="relative w-48 h-48 border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-gray-300"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image src={imagePreview} alt="Preview de imagen" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-all duration-200">
                    <div className="text-center text-white opacity-0 hover:opacity-100">
                      <Upload className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-xs">Cambiar imagen</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="w-48 h-48 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 border-gray-300 hover:border-blue-400"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center text-gray-500">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Sin imagen</p>
                    <p className="text-xs mt-1">Haz clic para seleccionar</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={e => handleFieldChange("descripcion", e.target.value)}
            />
          </div>

          <div>
            <VariedadesSelector onVariedadesChange={vars => handleFieldChange("variedades", vars)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Notas de cata</Label>
              <Input
                name="notas_cata"
                value={formData.notas_cata}
                onChange={e => handleFieldChange("notas_cata", e.target.value)}
              />
            </div>

            <div>
              <Label>Tipo de crianza</Label>
              <Input
                name="tipo_crianza"
                value={formData.tipo_crianza}
                onChange={e => handleFieldChange("tipo_crianza", e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={isUploading} className="w-full">
            {isUploading ? "Guardando..." : "Guardar vino"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}