import { useFormStatus } from 'react-dom';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Wine } from '@/types';

function SubmitButton({ isDisabled }: { isDisabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending || isDisabled} 
      variant="destructive"
      aria-describedby="submit-status"
    >
      {pending ? 'Eliminando...' : 'Eliminar vino'}
    </Button>
  );
}

export default function DeleteWineModal({ vino, children }: {
  vino: Wine;
  children: ReactNode;
}) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmValid = confirmText === vino.nombre;

  async function handleDelete(formData: FormData) {
    const json = Object.fromEntries(formData.entries());
    console.log('Eliminar vino con datos:', json);
    // Aquí llamas a tu API para eliminar el vino
    await new Promise((res) => setTimeout(res, 1000));
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Vino
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el vino{' '}
            <span className="font-semibold">{vino.nombre}</span> de {vino.wine_details.bodega}.
          </DialogDescription>
        </DialogHeader>

        <form action={handleDelete} className="space-y-4 mt-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium mb-2">
              ⚠️ Advertencia
            </p>
            <p className="text-sm text-muted-foreground">
              Para confirmar la eliminación, escribe exactamente el nombre del vino: <strong>{vino.nombre}</strong>
            </p>
          </div>

          <div>
            <Label htmlFor="confirm-text">Confirmar nombre del vino</Label>
            <Input 
              id="confirm-text"
              name="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Escribe: ${vino.nombre}`}
              className={!isConfirmValid && confirmText ? 'border-destructive' : ''}
            />
            {!isConfirmValid && confirmText && (
              <p className="text-sm text-destructive mt-1">
                El nombre debe coincidir exactamente con "{vino.nombre}"
              </p>
            )}
          </div>

          {/* Campos ocultos para enviar datos del vino */}
          <Input type="hidden" name="vino_id" value={vino.id_vino} />
          <Input type="hidden" name="vino_nombre" value={vino.nombre} />

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1">
              Cancelar
            </Button>
            <SubmitButton isDisabled={!isConfirmValid} />
          </div>
          
          <p id="submit-status" className="sr-only" aria-live="polite">
            Estado del formulario
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}