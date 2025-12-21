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
import ReactDOM from "react-dom";

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

	// Sincronizar cuando cambian las variedades por defecto
	useEffect(() => {
		setSelectedVariedades(defaultVariedades.map(v => ({ value: v, label: v })));
	}, [defaultVariedades]);

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
	onWineUpdate,
}: {
  vino: Wine;
  children: ReactNode;
  onWineUpdate?: () => void;
}) {
	// Estado para almacenar los valores actuales del formulario
	const [formData, setFormData] = useState({
		// Campos de la tabla wines
		nombre: vino.nombre,
		precio: vino.precio,
		url_imagen: vino.url_imagen,
		descripcion: vino.descripcion || '',
		nivel_alcohol: vino.nivel_alcohol.toString(),
		variedades: vino.variedades,
		pais_importacion: vino.pais_importacion,
		color_vino: vino.color_vino,
		stock: vino.stock,
		capacidad: vino.capacidad,
		// Campos de la tabla wine_details
		bodega: vino.wine_details.bodega || '',
		notas_cata: vino.wine_details.notas_cata || '',
		tipo_crianza: vino.wine_details.tipo_crianza || '',
	});

	// Estados para manejo de imagen
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Estados para drag and drop
	const [isDragOver, setIsDragOver] = useState(false);
	const [showDragOverlay, setShowDragOverlay] = useState(false);

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

	// Función para manejar drag and drop
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
		setShowDragOverlay(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		setShowDragOverlay(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		setShowDragOverlay(false);

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

			// Conexión con bucket exitosa
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

			// Iniciando subida de imagen
			// Tamaño del archivo

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

			// Imagen subida exitosamente

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

			// URL firmada obtenida
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
		if (parseFloat(formData.nivel_alcohol) !== vino.nivel_alcohol) {
			winesChanges.nivel_alcohol = parseFloat(formData.nivel_alcohol);
		}
		if (JSON.stringify(formData.variedades) !== JSON.stringify(vino.variedades)) winesChanges.variedades = formData.variedades;
		if (formData.pais_importacion !== vino.pais_importacion) winesChanges.pais_importacion = formData.pais_importacion;
		if (formData.color_vino !== vino.color_vino) winesChanges.color_vino = formData.color_vino;
		if (formData.stock !== vino.stock) winesChanges.stock = formData.stock;
		if (formData.capacidad !== vino.capacidad) winesChanges.capacidad = formData.capacidad;

		// Comparar campos de la tabla wine_details
		if (formData.bodega !== vino.wine_details.bodega) wineDetailsChanges.bodega = formData.bodega;
		if (formData.notas_cata !== vino.wine_details.notas_cata) wineDetailsChanges.notas_cata = formData.notas_cata;
		if (formData.tipo_crianza !== vino.wine_details.tipo_crianza) wineDetailsChanges.tipo_crianza = formData.tipo_crianza;

		return {
			wines: Object.keys(winesChanges).length > 0 ? { id_vino: vino.id_vino, ...winesChanges } : null,
			wineDetails: Object.keys(wineDetailsChanges).length > 0 ? { id_vino: vino.id_vino, ...wineDetailsChanges } : null
		};
	};

	const { toast } = useToast();
	const [open, setOpen] = useState(false);

	// Actualizar formData cuando cambie el prop vino
	useEffect(() => {
		// EditWineModal - useEffect disparado. Vino actual
		setFormData({
			// Campos de la tabla wines
			nombre: vino.nombre,
			precio: vino.precio,
			url_imagen: vino.url_imagen,
			descripcion: vino.descripcion || '',
			nivel_alcohol: vino.nivel_alcohol.toString(),
			variedades: vino.variedades,
			pais_importacion: vino.pais_importacion,
			color_vino: vino.color_vino,
			stock: vino.stock,
			capacidad: vino.capacidad,
			// Campos de la tabla wine_details
			bodega: vino.wine_details.bodega || '',
			notas_cata: vino.wine_details.notas_cata || '',
			tipo_crianza: vino.wine_details.tipo_crianza || ''
		});
		// EditWineModal - formData actualizado
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
		vino.wine_details.tipo_crianza
	]);

	// EditWineModal - formData actual (en cada render)

	async function handleEdit(formData: FormData) {
		setIsUploading(true);

		try {
			let finalImageUrl = vino.url_imagen;

			// Si hay una imagen seleccionada, subirla primero
			if (selectedImage) {
				// Iniciando proceso de subida de imagen
				// Archivo seleccionado

				try {
					finalImageUrl = await uploadImageToStorage(selectedImage);
					// Imagen subida exitosamente

					// Actualizar el formData con la nueva URL
					handleFieldChange('url_imagen', finalImageUrl);
				} catch (uploadError) {
					console.error('Error en la subida de imagen:', uploadError);
					toast({
						title: "Error",
						description: "Error al subir la imagen. Por favor, intenta de nuevo.",
						variant: "destructive"
					});
					setIsUploading(false);
					return;
				}
			}

			const updateData = createUpdateData();

			// Si se subió una imagen, asegurarse de que esté en el JSON de wines
			if (selectedImage && updateData.wines) {
				updateData.wines.url_imagen = finalImageUrl;
			} else if (selectedImage && !updateData.wines) {
				updateData.wines = { id_vino: vino.id_vino, url_imagen: finalImageUrl };
			}

			// Datos de actualización
			// Tabla wines
			// Tabla wine_details

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

				// Tabla wines actualizada
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

				// Tabla wine_details actualizada
			}

			// Actualización completada exitosamente

			// Resetear estados de imagen después del éxito
			setSelectedImage(null);
			setImagePreview(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}

			// Detectar cambios para el toast
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
			};

			// Verificar cambios
			if (vino.nombre !== fieldMap.nombre) changedFields.push(`nombre: ${fieldMap.nombre}`);
			if (vino.precio != fieldMap.precio) changedFields.push(`precio: ${fieldMap.precio}`);
			if (vino.descripcion !== fieldMap.descripcion) changedFields.push(`descripción: ${fieldMap.descripcion}`);
			if (vino.nivel_alcohol != fieldMap.nivel_alcohol) changedFields.push(`alcohol: ${fieldMap.nivel_alcohol}%`);
			if (vino.variedades.join(", ") !== fieldMap.variedades) changedFields.push(`variedades: ${fieldMap.variedades}`);
			if (vino.pais_importacion !== fieldMap.pais_importacion) changedFields.push(`país: ${fieldMap.pais_importacion}`);
			if (vino.color_vino !== fieldMap.color_vino) changedFields.push(`color: ${fieldMap.color_vino}`);
			if (vino.stock != fieldMap.stock) changedFields.push(`stock: ${fieldMap.stock}`);
			if (vino.capacidad != fieldMap.capacidad) changedFields.push(`capacidad: ${fieldMap.capacidad}ml`);
			if (vino.wine_details.bodega !== fieldMap.bodega) changedFields.push(`bodega: ${fieldMap.bodega}`);
			if (vino.wine_details.notas_cata !== fieldMap.notas_cata) changedFields.push(`notas de cata: ${fieldMap.notas_cata}`);
			if (vino.wine_details.tipo_crianza !== fieldMap.tipo_crianza) changedFields.push(`crianza: ${fieldMap.tipo_crianza}`);
			if (vino.url_imagen !== finalImageUrl) changedFields.push(`imagen actualizada`);

			// Toast de éxito
			toast({
				title: "¡Vino actualizado exitosamente!",
				description: changedFields.length > 0
					? `Cambios realizados: ${changedFields.join(", ")}`
					: "Actualización completada.",
			});

			// Cerrar modal
			setOpen(false);

			// Llamar al callback para actualizar la lista en el componente padre
			if (onWineUpdate) {
				// Llamando a onWineUpdated callback
				onWineUpdate();
			}

		} catch (error) {
			console.error('Error en la actualización:', error);
			toast({
				title: "Error al actualizar",
				description: "Ha ocurrido un error al actualizar el vino. Por favor, intenta de nuevo.",
				variant: "destructive"
			});
		} finally {
			setIsUploading(false);
		}
	}

	// Overlay global de drag & drop
	let dragDropOverlay = null;
	if (showDragOverlay && typeof window !== "undefined" && document.body) {
		dragDropOverlay = ReactDOM.createPortal(
			<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
				<div
					className="bg-white rounded-lg p-8 border-2 border-dashed border-blue-500 shadow-lg"
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					<div className="text-center">
						<Upload className="h-16 w-16 mx-auto mb-4 text-blue-500" />
						<h3 className="text-lg font-semibold mb-2">Suelta la imagen aquí</h3>
						<p className="text-gray-600">La imagen se cargará automáticamente</p>
					</div>
				</div>
			</div>,
			document.body
		);
	}

	return (
		<>
			{dragDropOverlay}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Editar Vino</DialogTitle>
					</DialogHeader>

					{/* Ventana flotante de drag & drop */}
					{/* This overlay is now handled by ReactDOM.createPortal */}

					<form
						action={handleEdit}
						className="space-y-6 mt-4"
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
					>
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
									onChange={(e) => {
										const value = e.target.value;
										handleFieldChange('nivel_alcohol', value);
									}}
									step="0.01"
									min="0"
									max="100"
									placeholder="Ej: 13.5"
								/>

							</div>

							<div>
								<Label>Stock</Label>
								<Input
									type="number"
									name="stock"
									value={formData.stock === undefined || isNaN(formData.stock) ? "" : formData.stock}
									onChange={(e) => {
										const value = e.target.value;
										handleFieldChange('stock', value === "" ? "" : parseInt(value));
									}}
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
										className="relative w-48 h-48 border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-gray-300"
										onClick={() => fileInputRef.current?.click()}
									>
										<Image
											src={imagePreview}
											alt="Preview de imagen"
											fill
											className="object-cover"
										/>
										<div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-all duration-200">
											<div className="text-center text-white opacity-0 hover:opacity-100">
												<Upload className="h-6 w-6 mx-auto mb-1" />
												<p className="text-xs">Cambiar imagen</p>
											</div>
										</div>
									</div>
								) : (formData.url_imagen) ? (
									<div
										className="relative w-48 h-48 border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-gray-300"
										onClick={() => fileInputRef.current?.click()}
									>
										<Image
											src={formData.url_imagen}
											alt={`Imagen actual de ${formData.nombre}`}
											fill
											className="object-cover"
										/>
										<div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-all duration-200">
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
											<p className="text-xs text-blue-500 mt-1">o arrastra una imagen</p>
										</div>
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
						</div>

						{/* Submit */}
						<SubmitButton />
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
