'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Wine } from '@/types';
import { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import MultipleSelector, { Option } from '../ui/multiple-selector';
import { useToast } from "@/hooks/use-toast"

const TODAS_VARIEDADES = {
  "Vino Tinto": [
    "Carmenere",
  ],
  "Vino Blanco": [],
  "Vino Rosé": [
    "Syrah Rosé",
  ],
  "Vino Espumoso": [],
  "Ecológico": []
};

// Crear opciones para el MultipleSelector
const VARIEDADES_OPTIONS: Option[] = Object.entries(TODAS_VARIEDADES)
  .flatMap(([categoria, variedades]) => 
    variedades.map(variedad => ({
      value: variedad,
      label: variedad,
      categoria: categoria
    }))
  );

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Guardando...' : 'Guardar cambios'}
    </Button>
  );
}

function VariedadesSelector({ defaultVariedades = [], onVariedadesChange }: { 
  defaultVariedades?: string[];
  onVariedadesChange: (variedades: string[]) => void;
}) {
  const [selectedVariedades, setSelectedVariedades] = useState<Option[]>(
    defaultVariedades.map(v => ({ value: v, label: v }))
  );

  const handleVariedadesChange = (options: Option[]) => {
    setSelectedVariedades(options);
    onVariedadesChange(options.map(opt => opt.value));
  };

  return (
    <div className="space-y-2">
      <Label>Variedades</Label>
      <MultipleSelector
        className="w-full"
        value={selectedVariedades}
        onChange={handleVariedadesChange}
        options={VARIEDADES_OPTIONS}
        placeholder="Seleccionar variedades..."
        hideClearAllButton={true}
      />

      {/* Inputs hidden para el formulario */}
      {selectedVariedades.map((v, i) => (
        <input key={i} type="hidden" name="variedades" value={v.value} />
      ))}
    </div>
  );
}

export default function EditWineModal({
  vino,
  children,
}: {
  vino: Wine;
  children: ReactNode;
}) {
  console.log('EditWineModal - Vino recibido como prop:', vino);
  // Estado para almacenar los valores actuales del formulario
  const [formData, setFormData] = useState({
    // Campos de la tabla wines
    nombre: vino.nombre,
    precio: vino.precio,
    url_imagen: vino.url_imagen,
    descripcion: vino.descripcion || '',
    nivel_alcohol: vino.nivel_alcohol,
    variedades: vino.variedades,
    pais_importacion: vino.pais_importacion,
    color_vino: vino.color_vino,
    stock: vino.stock,
    capacidad: vino.capacidad,
    // Campos de la tabla wine_details
    bodega: vino.wine_details.bodega || '',
    notas_cata: vino.wine_details.notas_cata || '',
    tipo_crianza: vino.wine_details.tipo_crianza || '',
    contenido_azucar: vino.wine_details.contenido_azucar || '',
    contenido_carbonico: vino.wine_details.contenido_carbonico || '',
  });

  // Estados para manejo de imagen
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función para detectar cambios en campos específicos
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar la selección de imagen
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona solo archivos de imagen');
        return;
      }
      
      setSelectedImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para eliminar imagen seleccionada
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Estados para drag and drop
  const [isDragOver, setIsDragOver] = useState(false);

  // Función para manejar drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona solo archivos de imagen');
        return;
      }
      
      setSelectedImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Actualizar el input file
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  // Función para verificar la conexión con el bucket
  const checkBucketConnection = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('images')
        .list('');
      
      if (error) {
        console.error('Error verificando bucket:', error);
        return false;
      }
      
      console.log('Conexión con bucket exitosa:', data);
      return true;
    } catch (error) {
      console.error('Error en checkBucketConnection:', error);
      return false;
    }
  };

  // Función para subir imagen a Supabase Storage
  const uploadImageToStorage = async (file: File): Promise<string> => {
    try {
      // Verificar conexión con el bucket primero
      const bucketOk = await checkBucketConnection();
      if (!bucketOk) {
        throw new Error('No se puede conectar con el bucket de imágenes');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName; // No necesitamos la carpeta "images" porque ya estamos en el bucket "images"

      console.log('Iniciando subida de imagen:', fileName);
      console.log('Tamaño del archivo:', file.size, 'bytes');

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error subiendo imagen:', uploadError);
        throw uploadError;
      }

      console.log('Imagen subida exitosamente:', uploadData);

      // Obtener URL firmada para bucket privado
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('images')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 año

      if (signedUrlError) {
        console.error('Error obteniendo URL firmada:', signedUrlError);
        throw signedUrlError;
      }

      if (!signedUrlData?.signedUrl) {
        throw new Error('No se pudo obtener la URL firmada');
      }

      console.log('URL firmada obtenida:', signedUrlData.signedUrl);
      return signedUrlData.signedUrl;

    } catch (error) {
      console.error('Error completo en uploadImageToStorage:', error);
      throw error;
    }
  };

  // Función para comparar y crear JSONs separados
  const createUpdateData = () => {
    const winesChanges: any = {};
    const wineDetailsChanges: any = {};

    // Comparar campos de la tabla wines
    if (formData.nombre !== vino.nombre) winesChanges.nombre = formData.nombre;
    if (formData.precio !== vino.precio) winesChanges.precio = formData.precio;
    if (formData.url_imagen !== vino.url_imagen) winesChanges.url_imagen = formData.url_imagen;
    if (formData.descripcion !== vino.descripcion) winesChanges.descripcion = formData.descripcion;
    if (formData.nivel_alcohol !== vino.nivel_alcohol) winesChanges.nivel_alcohol = formData.nivel_alcohol;
    if (JSON.stringify(formData.variedades) !== JSON.stringify(vino.variedades)) winesChanges.variedades = formData.variedades;
    if (formData.pais_importacion !== vino.pais_importacion) winesChanges.pais_importacion = formData.pais_importacion;
    if (formData.color_vino !== vino.color_vino) winesChanges.color_vino = formData.color_vino;
    if (formData.stock !== vino.stock) winesChanges.stock = formData.stock;
    if (formData.capacidad !== vino.capacidad) winesChanges.capacidad = formData.capacidad;

    // Comparar campos de la tabla wine_details
    if (formData.bodega !== vino.wine_details.bodega) wineDetailsChanges.bodega = formData.bodega;
    if (formData.notas_cata !== vino.wine_details.notas_cata) wineDetailsChanges.notas_cata = formData.notas_cata;
    if (formData.tipo_crianza !== vino.wine_details.tipo_crianza) wineDetailsChanges.tipo_crianza = formData.tipo_crianza;
    if (formData.contenido_azucar !== vino.wine_details.contenido_azucar) wineDetailsChanges.contenido_azucar = formData.contenido_azucar;
    if (formData.contenido_carbonico !== vino.wine_details.contenido_carbonico) wineDetailsChanges.contenido_carbonico = formData.contenido_carbonico;

    return {
      wines: Object.keys(winesChanges).length > 0 ? { id_vino: vino.id_vino, ...winesChanges } : null,
      wineDetails: Object.keys(wineDetailsChanges).length > 0 ? { id_vino: vino.id_vino, ...wineDetailsChanges } : null
    };
  };

  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // Actualizar formData cuando cambie el prop vino
  useEffect(() => {
    console.log('EditWineModal - useEffect disparado. Vino actual:', vino);
    setFormData({
      // Campos de la tabla wines
      nombre: vino.nombre,
      precio: vino.precio,
      url_imagen: vino.url_imagen,
      descripcion: vino.descripcion || '',
      nivel_alcohol: vino.nivel_alcohol,
      variedades: vino.variedades,
      pais_importacion: vino.pais_importacion,
      color_vino: vino.color_vino,
      stock: vino.stock,
      capacidad: vino.capacidad,
      // Campos de la tabla wine_details
      bodega: vino.wine_details.bodega || '',
      notas_cata: vino.wine_details.notas_cata || '',
      tipo_crianza: vino.wine_details.tipo_crianza || '',
      contenido_azucar: vino.wine_details.contenido_azucar || '',
      contenido_carbonico: vino.wine_details.contenido_carbonico || '',
    });
    console.log('EditWineModal - formData actualizado a:', formData);
  }, [
    vino.nombre,
    vino.precio,
    vino.url_imagen,
    vino.descripcion,
    vino.nivel_alcohol,
    vino.variedades,
    vino.pais_importacion,
    vino.color_vino,
    vino.stock,
    vino.capacidad,
    vino.wine_details.bodega,
    vino.wine_details.notas_cata,
    vino.wine_details.tipo_crianza,
    vino.wine_details.contenido_azucar,
    vino.wine_details.contenido_carbonico,
  ]);

  console.log('EditWineModal - formData actual (en cada render):', formData);

  async function handleEdit(formData: FormData) {
    setIsUploading(true);
    
    try {
      let finalImageUrl = vino.url_imagen;

      // Si hay una imagen seleccionada, subirla primero
      if (selectedImage) {
        console.log('Iniciando proceso de subida de imagen...');
        console.log('Archivo seleccionado:', selectedImage.name, selectedImage.size, selectedImage.type);
        
        try {
          finalImageUrl = await uploadImageToStorage(selectedImage);
          console.log('Imagen subida exitosamente:', finalImageUrl);
          
          // Actualizar el formData con la nueva URL
          setFormData(prev => ({
            ...prev,
            url_imagen: finalImageUrl
          }));
        } catch (uploadError) {
          console.error('Error en la subida de imagen:', uploadError);
          alert('Error al subir la imagen. Por favor, intenta de nuevo.');
          setIsUploading(false);
          return;
        }
      } else {
        console.log('No hay imagen seleccionada para subir');
      }

      const updateData = createUpdateData();
      
      // Si se subió una imagen, asegurarse de que esté en el JSON de wines
      if (selectedImage && updateData.wines) {
        updateData.wines.url_imagen = finalImageUrl;
      } else if (selectedImage && !updateData.wines) {
        updateData.wines = { id_vino: vino.id_vino, url_imagen: finalImageUrl };
      }
      
      console.log('Datos de actualización:');
      console.log('Tabla wines:', updateData.wines);
      console.log('Tabla wine_details:', updateData.wineDetails);
      
      // Actualizar tabla wines si hay cambios
      if (updateData.wines) {
        const { data: winesData, error: winesError } = await supabase
          .from('wines')
          .update(updateData.wines)
          .eq('id_vino', vino.id_vino)
          .select();
        
        if (winesError) {
          console.error('Error actualizando tabla wines:', winesError);
          throw winesError;
        }
        
        console.log('Tabla wines actualizada:', winesData);
      }
      
      // Actualizar tabla wine_details si hay cambios
      if (updateData.wineDetails) {
        const { data: wineDetailsData, error: wineDetailsError } = await supabase
          .from('wine_details')
          .update(updateData.wineDetails)
          .eq('id_vino', vino.id_vino)
          .select();
        
        if (wineDetailsError) {
          console.error('Error actualizando tabla wine_details:', wineDetailsError);
          throw wineDetailsError;
        }
        
        console.log('Tabla wine_details actualizada:', wineDetailsData);
      }
      
      console.log('Actualización completada exitosamente');
      // Detectar cambios
      const changedFields: string[] = [];
      const fieldMap: Record<string, any> = {
        nombre: formData.get("nombre"),
        precio: formData.get("precio"),
        descripcion: formData.get("descripcion"),
        nivel_alcohol: formData.get("nivel_alcohol"),
        variedades: formData.getAll("variedades").join(", "),
        pais_importacion: formData.get("pais_importacion"),
        color_vino: formData.get("color_vino"),
        stock: formData.get("stock"),
        capacidad: formData.get("capacidad"),
        bodega: formData.get("bodega"),
        notas_cata: formData.get("notas_cata"),
        tipo_crianza: formData.get("tipo_crianza"),
        contenido_azucar: formData.get("contenido_azucar"),
        contenido_carbonico: formData.get("contenido_carbonico"),
      };
      if (vino.nombre !== fieldMap.nombre) changedFields.push(`nombre: ${fieldMap.nombre}`);
      if (vino.precio != fieldMap.precio) changedFields.push(`precio: ${fieldMap.precio}`);
      if (vino.descripcion !== fieldMap.descripcion) changedFields.push(`descripcion: ${fieldMap.descripcion}`);
      if (vino.nivel_alcohol != fieldMap.nivel_alcohol) changedFields.push(`nivel_alcohol: ${fieldMap.nivel_alcohol}`);
      if (vino.variedades.join(", ") !== fieldMap.variedades) changedFields.push(`variedades: ${fieldMap.variedades}`);
      if (vino.pais_importacion !== fieldMap.pais_importacion) changedFields.push(`pais: ${fieldMap.pais_importacion}`);
      if (vino.color_vino !== fieldMap.color_vino) changedFields.push(`color: ${fieldMap.color_vino}`);
      if (vino.stock != fieldMap.stock) changedFields.push(`stock: ${fieldMap.stock}`);
      if (vino.capacidad != fieldMap.capacidad) changedFields.push(`capacidad: ${fieldMap.capacidad}`);
      if (vino.wine_details.bodega !== fieldMap.bodega) changedFields.push(`bodega: ${fieldMap.bodega}`);
      if (vino.wine_details.notas_cata !== fieldMap.notas_cata) changedFields.push(`notas_cata: ${fieldMap.notas_cata}`);
      if (vino.wine_details.tipo_crianza !== fieldMap.tipo_crianza) changedFields.push(`tipo_crianza: ${fieldMap.tipo_crianza}`);
      if (vino.wine_details.contenido_azucar !== fieldMap.contenido_azucar) changedFields.push(`contenido_azucar: ${fieldMap.contenido_azucar}`);
      if (vino.wine_details.contenido_carbonico !== fieldMap.contenido_carbonico) changedFields.push(`contenido_carbonico: ${fieldMap.contenido_carbonico}`);
      // Imagen
      if (vino.url_imagen !== finalImageUrl) changedFields.push(`imagen: nueva imagen`);
      // Toast
      toast({
        title: "Vino actualizado",
        description: changedFields.length > 0
          ? `Has actualizado: ${changedFields.join(", ")}`
          : "No se detectaron cambios.",
      });
      setOpen(false);
    } catch (error) {
      console.error('Error en la actualización:', error);
      // Aquí podrías mostrar un toast de error al usuario
    } finally {
      setIsUploading(false);
    }
    
    await new Promise((res) => setTimeout(res, 1000));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Vino</DialogTitle>
        </DialogHeader>

        <form action={handleEdit} className="space-y-6 mt-4">
          {/* Primera fila - Información básica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input 
                name="nombre" 
                value={formData.nombre} 
                onChange={(e) => handleFieldChange('nombre', e.target.value)}
                required 
              />
            </div>

            <div>
              <Label>Precio</Label>
              <Input 
                type="number" 
                name="precio" 
                value={formData.precio} 
                onChange={(e) => handleFieldChange('precio', parseFloat(e.target.value))}
                required 
              />
            </div>

            <div>
              <Label>Alcohol (%)</Label>
              <Input 
                type="number" 
                name="nivel_alcohol" 
                value={formData.nivel_alcohol} 
                onChange={(e) => handleFieldChange('nivel_alcohol', parseFloat(e.target.value))}
              />
            </div>

            <div>
              <Label>Stock</Label>
              <Input 
                type="number" 
                name="stock" 
                value={formData.stock} 
                onChange={(e) => handleFieldChange('stock', parseInt(e.target.value))}
              />
            </div>

            <div>
              <Label>Color</Label>
              <Select value={formData.color_vino} onValueChange={(value) => handleFieldChange('color_vino', value)}>
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
                onChange={(e) => handleFieldChange('pais_importacion', e.target.value)}
              />
            </div>

            <div>
              <Label>Capacidad</Label>
              <Input 
                name="capacidad" 
                value={formData.capacidad} 
                type="number" 
                onChange={(e) => handleFieldChange('capacidad', parseFloat(e.target.value))}
              />
            </div>

            <div>
              <Label>Bodega</Label>
              <Input 
                name="bodega" 
                value={formData.bodega} 
                onChange={(e) => handleFieldChange('bodega', e.target.value)}
              />
            </div>
          </div>

          {/* Segunda fila - Imagen */}
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
              {selectedImage ? (
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
              ) : vino.url_imagen && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const result = await checkBucketConnection();
                    alert(result ? 'Conexión exitosa con el bucket' : 'Error de conexión con el bucket');
                  }}
                  className="flex items-center gap-2"
                >
                  Test Bucket
                </Button>
              )}
            </div>

            <div className="flex justify-center">
              {imagePreview ? (
                <div 
                  className={`relative w-48 h-48 border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                    isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image
                    src={imagePreview}
                    alt="Preview de imagen"
                    fill
                    className="object-cover"
                  />
                  {isDragOver && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                      <div className="text-center text-blue-700 font-medium">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <p>Suelta la imagen aquí</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (formData.url_imagen) ? (
                <div 
                  className={`relative w-48 h-48 border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                    isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image
                    src={formData.url_imagen}
                    alt={`Imagen actual de ${formData.nombre}`}
                    fill
                    className="object-cover"
                  />
                  {isDragOver && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                      <div className="text-center text-blue-700 font-medium">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <p>Suelta la imagen aquí</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className={`w-48 h-48 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
                    isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center text-gray-500">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Sin imagen</p>
                    <p className="text-xs mt-1">Arrastra una imagen aquí o haz clic</p>
                  </div>
                  {isDragOver && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center rounded-lg">
                      <div className="text-center text-blue-700 font-medium">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <p>Suelta la imagen aquí</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tercera fila - Descripción */}
          <div>
            <Label>Descripción</Label>
            <Textarea 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={(e) => handleFieldChange('descripcion', e.target.value)}
            />
          </div>

          {/* Cuarta fila - Variedades */}
          <div>
            <VariedadesSelector
              defaultVariedades={formData.variedades} 
              onVariedadesChange={(variedades) => handleFieldChange('variedades', variedades)}
            />
          </div>

          {/* Quinta fila - Detalles adicionales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Notas de cata</Label>
              <Input 
                name="notas_cata" 
                value={formData.notas_cata} 
                onChange={(e) => handleFieldChange('notas_cata', e.target.value)}
              />
            </div>

            <div>
              <Label>Tipo de crianza</Label>
              <Input 
                name="tipo_crianza" 
                value={formData.tipo_crianza} 
                onChange={(e) => handleFieldChange('tipo_crianza', e.target.value)}
              />
            </div>

            <div>
              <Label>Contenido azúcar</Label>
              <Input 
                name="contenido_azucar" 
                value={formData.contenido_azucar} 
                onChange={(e) => handleFieldChange('contenido_azucar', e.target.value)}
              />
            </div>

            <div>
              <Label>Contenido carbonico</Label>
              <Input 
                name="contenido_carbonico" 
                value={formData.contenido_carbonico} 
                onChange={(e) => handleFieldChange('contenido_carbonico', e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <div>
            {/* <Button type="submit" disabled={isUploading} className="w-full">
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo imagen y guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button> */}
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
