"use client"

import { User, LogOut, Truck, Store, Settings, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/providers/auth-provider"
import { WineIcon} from "lucide-react"

interface UserMenuProps {
  currentView: "store" | "admin" | "cart"
  onViewChange: (view: "store" | "admin" | "cart") => void
  availableViews: ("store" | "admin" | "cart")[]
}

export function UserMenu({ currentView, onViewChange, availableViews }: UserMenuProps) {
	const { logout, user } = useAuth()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">
					<User className="h-4 w-4" />
					{user?.isAdmin ? <WineIcon /> : user?.name || "Usuario"}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{availableViews.includes("store") && (
					<DropdownMenuItem onClick={() => onViewChange("store")}>
						<Store className="h-4 w-4 mr-2" />
            Tienda
					</DropdownMenuItem>
				)}
        
				{availableViews.includes("cart") && (
					<DropdownMenuItem onClick={() => onViewChange("cart")}>
						<ShoppingCart className="h-4 w-4 mr-2" />
            Carrito
					</DropdownMenuItem>
				)}
        
				{user?.isAdmin && availableViews.includes("admin") && (
					<DropdownMenuItem onClick={() => onViewChange("admin")}>
						<Settings className="h-4 w-4 mr-2" />
            Panel de Administración
					</DropdownMenuItem>
				)}
        
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={logout}>
					<LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
