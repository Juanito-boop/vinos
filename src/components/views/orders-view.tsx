"use client"

import { useOrderStatus } from "@/providers/order-status-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Package, Truck, CheckCircle, AlertCircle } from "lucide-react"

const statusConfig = {
  pendiente: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock
  },
  preparandose: {
    label: "Preparándose", 
    color: "bg-blue-100 text-blue-800",
    icon: Package
  },
  "listo para enviarse": {
    label: "Listo para enviarse",
    color: "bg-purple-100 text-purple-800", 
    icon: Package
  },
  enviandose: {
    label: "Enviándose",
    color: "bg-orange-100 text-orange-800",
    icon: Truck
  },
  listo: {
    label: "Entregado",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle
  }
}

export function OrdersView() {
  const { userId, orderStatus } = useOrderStatus()
  const currentStatus = statusConfig[orderStatus]
  const StatusIcon = currentStatus.icon

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Debes iniciar sesión para ver tus pedidos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5" />
            Estado del Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge className={currentStatus.color}>
              {currentStatus.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ID del usuario: {userId.slice(0, 8)}...
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 