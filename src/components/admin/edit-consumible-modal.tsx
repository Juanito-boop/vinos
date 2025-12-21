import { useState, useRef } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Consumibles } from '@/types';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function EditConsumibleModal({
	consumible,
	children,
	onSave,
}: {
  consumible: Consumibles;
  children: React.ReactNode;
  onSave: (c: Consumibles) => void;
}) {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState({
		nombre: consumible.nombre,
		descripcion: consumible.descripcion,
		precio: consumible.precio,
		url_imagen: consumible.url_imagen,
	});
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(consumible.url_imagen);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const { toast } = useToast();

	const handleFieldChange = (field: string, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (!file.type.startsWith('image/')) {
				alert('Por favor selecciona solo archivos de imagen');
				return;
			}
			setSelectedImage(file);
			const reader = new FileReader();
			reader.onload = (e) => setImagePreview(e.target?.result as string);
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveImage = () => {
		setSelectedImage(null);
		setImagePreview(null);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	// --- NUEVO FLUJO: Subir imagen y obtener URL firmada ---
	const checkBucketConnection = async () => {
		try {
			const { error } = await supabase.storage.from('images').list('');
			if (error) {
				console.error('Error verificando bucket:', error);
				return false;
			}
			return true;
		} catch (error) {
			console.error('Error en checkBucketConnection:', error);
			return false;
		}
	};

	const uploadImageToStorage = async (file: File): Promise<string> => {
		try {
			const bucketOk = await checkBucketConnection();
			if (!bucketOk) {
				throw new Error('No se puede conectar con el bucket de imágenes');
			}
			const ext = file.name.split('.').pop();
			const fileName = `consumible-${consumible.id}-${Date.now()}.${ext}`;
			const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file, { upsert: false });
			if (uploadError) throw uploadError;
			// Obtener URL firmada por 1 año
			const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('images').createSignedUrl(fileName, 60 * 60 * 24 * 365);
			if (signedUrlError) throw signedUrlError;
			if (!signedUrlData?.signedUrl) throw new Error('No se pudo obtener la URL firmada');
			return signedUrlData.signedUrl;
		} catch (error) {
			console.error('Error completo en uploadImageToStorage:', error);
			throw error;
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsUploading(true);
		let imageUrl = formData.url_imagen;
		try {
			if (selectedImage) {
				imageUrl = await uploadImageToStorage(selectedImage);
			}
			const { error } = await supabase
				.from('consumibles')
				.update({
					nombre: formData.nombre,
					descripcion: formData.descripcion,
					precio: formData.precio,
					url_imagen: imageUrl,
				})
				.eq('id', consumible.id);
			if (error) throw error;
			toast({ title: 'Consumible actualizado', description: 'Los cambios se guardaron correctamente.' });
			onSave({ ...consumible, ...formData, url_imagen: imageUrl });
			setOpen(false);
		} catch (err: any) {
			toast({ title: 'Error al guardar', description: err.message || 'No se pudo guardar el consumible', variant: 'destructive' });
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Editar consumible</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label>Nombre</Label>
						<Input
							value={formData.nombre}
							onChange={e => handleFieldChange('nombre', e.target.value)}
							required
						/>
					</div>
					<div>
						<Label>Descripción</Label>
						<Textarea
							value={formData.descripcion}
							onChange={e => handleFieldChange('descripcion', e.target.value)}
							required
						/>
					</div>
					<div>
						<Label>Precio</Label>
						<Input
							type="number"
							min={0}
							value={formData.precio}
							onChange={e => handleFieldChange('precio', Number(e.target.value))}
							required
						/>
					</div>
					<div>
						<Label>Imagen</Label>
						<div className="flex flex-col items-center gap-4 mt-2">
							<Input
								type="file"
								accept="image/*"
								ref={fileInputRef}
								onChange={handleImageSelect}
								className="w-full"
							/>
							{imagePreview && (
								<div className="relative">
									<img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
									<button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={14} /></button>
								</div>
							)}
						</div>
					</div>
					<Button type="submit" className="w-full" disabled={isUploading}>
						{isUploading ? 'Guardando...' : 'Guardar cambios'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
} 