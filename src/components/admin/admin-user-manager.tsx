"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import { User, Crown, Shield, Users } from "lucide-react"
import { toast } from "sonner"

interface UserWithRole {
	id: string
	email: string
	created_at: string
	user_metadata: {
		role?: string
		isAdmin?: boolean
	}
	is_admin?: boolean
}

export function AdminUserManager() {
	const { user: currentUser, updateUserRole } = useAuth()
	const [users, setUsers] = useState<UserWithRole[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState("")

	// Verificar si el usuario actual es admin
	if (!currentUser?.isAdmin) {
		return (
			<Card className="w-full">
				<CardContent className="p-6">
					<div className="text-center">
						<Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
						<p className="text-gray-600">
							Solo los administradores pueden acceder a esta sección.
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	useEffect(() => {
		if (currentUser?.isAdmin) {
			loadUsers()
		}
	}, [currentUser?.isAdmin])

	const loadUsers = async () => {
		try {
			setIsLoading(true)
			
			// Usar la función RPC personalizada
			const { data, error } = await supabase.rpc('get_users_for_admin')
			
			if (error) {
				console.error('Error loading users:', error)
				toast.error('Error al cargar usuarios: ' + error.message)
				return
			}

			// Adaptar los datos recibidos
			const adaptedUsers: UserWithRole[] = (data || []).map((user: any) => ({
				id: user.id,
				email: user.email,
				created_at: user.created_at,
				user_metadata: user.user_metadata || {},
				is_admin: user.is_admin
			}))

			setUsers(adaptedUsers)
			toast.success(`${adaptedUsers.length} usuarios cargados`)
		} catch (error) {
			console.error('Error loading users:', error)
			toast.error('Error al cargar usuarios')
		} finally {
			setIsLoading(false)
		}
	}

	const handleRoleUpdate = async (userId: string, isAdmin: boolean) => {
		try {
			// Usar la función RPC para actualizar el rol
			const { data, error } = await supabase.rpc('update_user_role_safe', {
				target_user_id: userId,
				new_role: isAdmin ? 'admin' : 'user'
			})
			
			if (error) {
				throw error
			}
			
			// Recargar usuarios para reflejar cambios
			await loadUsers()
			toast.success(`Usuario ${isAdmin ? 'promovido a administrador' : 'degradado a usuario'}`)
		} catch (error: any) {
			console.error('Error updating user role:', error)
			toast.error('Error al actualizar el rol del usuario: ' + error.message)
		}
	}

	const filteredUsers = users.filter(user =>
		user.email.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const isUserAdmin = (user: UserWithRole) => {
		return user.is_admin || 
					user.user_metadata?.role === 'admin' || 
					user.user_metadata?.isAdmin === true ||
					user.email === 'acevedojuanesteban.colombia@gmail.com'
	}

	if (isLoading) {
		return (
			<Card className="w-full">
				<CardContent className="p-6">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
						<p>Cargando usuarios...</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Users className="h-5 w-5" />
					Gestión de Usuarios
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-4">
					<Input
						placeholder="Buscar por email..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="flex-1"
					/>
					<Button onClick={loadUsers} variant="outline">
						Actualizar
					</Button>
				</div>

				<div className="space-y-2">
					{filteredUsers.map((user) => (
						<div
							key={user.id}
							className="flex items-center justify-between p-3 border rounded-lg"
						>
							<div className="flex items-center gap-3">
								<User className="h-5 w-5 text-gray-500" />
								<div>
									<p className="font-medium">{user.email}</p>
									<p className="text-sm text-gray-500">
										Creado: {new Date(user.created_at).toLocaleDateString()}
									</p>
								</div>
							</div>
							
							<div className="flex items-center gap-2">
								{isUserAdmin(user) ? (
									<Badge variant="default" className="bg-purple-600">
										<Crown className="h-3 w-3 mr-1" />
										Admin
									</Badge>
								) : (
									<Badge variant="secondary">
										Usuario
									</Badge>
								)}
								
								{user.id !== currentUser?.id && (
									<Button
										size="sm"
										variant={isUserAdmin(user) ? "destructive" : "default"}
										onClick={() => handleRoleUpdate(user.id, !isUserAdmin(user))}
									>
										{isUserAdmin(user) ? "Quitar Admin" : "Hacer Admin"}
									</Button>
								)}
							</div>
						</div>
					))}
				</div>

				{filteredUsers.length === 0 && (
					<div className="text-center py-8">
						<Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<p className="text-gray-500">
							{searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
						</p>
					</div>
				)}

				{/* Información sobre la implementación */}
				<div className="bg-green-50 p-4 rounded-lg">
					<p className="text-sm text-green-800">
						<strong>✅ Implementación completa:</strong> Esta gestión de usuarios usa funciones RPC 
						personalizadas en Supabase que verifican permisos de administrador de forma segura.
					</p>
				</div>
			</CardContent>
		</Card>
	)
} 