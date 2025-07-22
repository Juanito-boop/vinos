"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminPanel } from "./admin-panel"
import { useConsumibles } from '@/hooks/use-consumibles';
import { Button } from '../ui/button';
import { SquarePen, Trash2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import type { Consumibles, Wine } from '@/types';
import EditConsumibleModal from "./edit-consumible-modal";

interface AdminViewProps {
  wines: Wine[]
}

export function AdminView({ wines }: AdminViewProps) {
  const { consumibles, isLoading: loadingConsumibles, error: errorConsumibles } = useConsumibles();
  const [searchConsumibleTerm, setSearchConsumibleTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editingConsumible, setEditingConsumible] = useState<Consumibles | null>(null);
  const [localConsumibles, setLocalConsumibles] = useState<Consumibles[]>([]);

  // Sincronizar localConsumibles con consumibles del hook
  useEffect(() => { setLocalConsumibles(consumibles); }, [consumibles]);

  const filteredConsumibles = useMemo(() => {
    const term = searchConsumibleTerm.toLowerCase();
    return localConsumibles.filter(c =>
      c.nombre.toLowerCase().includes(term) ||
      c.descripcion.toLowerCase().includes(term)
    );
  }, [localConsumibles, searchConsumibleTerm]);
  const totalPages = Math.ceil(filteredConsumibles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedConsumibles = filteredConsumibles.slice(startIndex, endIndex);

  function handleEditConsumible(consumible: Consumibles) {
    setEditingConsumible(consumible);
  }
  function handleSaveConsumibleEdit(updated: Consumibles) {
    setLocalConsumibles(prev => prev.map(c => c.id === updated.id ? updated : c));
    setEditingConsumible(null);
  }

  return (
    <section aria-label="Panel de administración">
      <Tabs defaultValue="Administracion de Vinos" className="w-full">
        <TabsList>
          <TabsTrigger value="Administracion de Vinos">Administracion de Vinos</TabsTrigger>
          <TabsTrigger value="Administracion de Consumibles">Administracion de Consumibles</TabsTrigger>
        </TabsList>
        <TabsContent value="Administracion de Vinos">
          <AdminPanel wines={wines} />
        </TabsContent>
        <TabsContent value="Administracion de Consumibles">
          <div>
            {loadingConsumibles && <div>Cargando consumibles...</div>}
            {errorConsumibles && <div className="text-red-500">{errorConsumibles?.message}</div>}
            {/* Barra de búsqueda */}
            <div className="flex justify-center mb-4">
              <input
                type="text"
                placeholder="Buscar consumible por nombre o descripción..."
                className="border border-gray-300 rounded-xl px-4 py-2 w-full max-w-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                value={searchConsumibleTerm}
                onChange={e => setSearchConsumibleTerm(e.target.value)}
              />
            </div>
            {filteredConsumibles.length === 0 ? (
              <div className="text-center text-gray-500">No hay consumibles disponibles.</div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100 mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Imagen</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Descripción</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Precio</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedConsumibles.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-red-50 bg-white">
                          <td className="px-6 py-4 text-center">
                            <img src={item.url_imagen} alt={item.nombre} className="w-16 h-16 object-cover rounded mx-auto border border-gray-200 shadow-sm" />
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-gray-900">{item.nombre}</td>
                          <td className="px-6 py-4 text-center text-gray-700">{item.descripcion}</td>
                          <td className="px-6 py-4 text-center font-semibold text-gray-900">
                            {new Intl.NumberFormat(
                              'es-CO', { 
                                style: 'currency', 
                                currency: 'COP', 
                                minimumFractionDigits: 0 
                              }).format(item.precio)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2 w-full">
                              <EditConsumibleModal
                                consumible={item}
                                onSave={handleSaveConsumibleEdit}
                              >
                                <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 h-8 w-8 rounded-md flex items-center justify-center transition-colors" title="Editar">
                                  <SquarePen size={16} />
                                </button>
                              </EditConsumibleModal>
                              <button className="bg-red-600 hover:bg-red-700 text-white p-2 h-8 w-8 rounded-md flex items-center justify-center transition-colors" title="Eliminar">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200 mt-2 rounded-2xl">
                    <div className="text-sm text-gray-700">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, filteredConsumibles.length)} de {filteredConsumibles.length} consumibles
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1"
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            className={`h-9 w-9 p-0 ${currentPage === page ? 'bg-red-600 hover:bg-red-700' : ''}`}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      {/* Modal de edición de consumible */}
      {editingConsumible && (
        <EditConsumibleModal
          consumible={editingConsumible}
          onSave={handleSaveConsumibleEdit}
        >
          {/* El trigger es invisible, el modal se abre por estado */}
          <span />
        </EditConsumibleModal>
      )}
    </section>
  )
} 