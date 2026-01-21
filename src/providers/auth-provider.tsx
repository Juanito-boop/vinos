"use client"
// src/providers/auth-provider.tsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface ExtendedUser extends User {
	isAdmin?: boolean;
}

const AuthContext = createContext<any>(null);

// Función para verificar si un usuario es administrador
function checkUserRole(user: User): ExtendedUser {
	const extendedUser = user as ExtendedUser;
	extendedUser.isAdmin = user.user_metadata?.role === 'admin' ||
		user.user_metadata?.isAdmin === true ||
		user.email === 'acevedojuanesteban.colombia@gmail.com';
	return extendedUser;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<ExtendedUser | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isProcessingMagicLink, setIsProcessingMagicLink] = useState(false);

	// Función para procesar el magic link desde el hash de la URL
	const processMagicLink = useCallback(async () => {
		if (typeof window === 'undefined') return;

		const hash = window.location.hash;
		if (!hash) return;

		// Extraer parámetros del hash
		const params = new URLSearchParams(hash.substring(1));
		const accessToken = params.get('access_token');
		const refreshToken = params.get('refresh_token');
		const expiresAt = params.get('expires_at');
		const tokenType = params.get('token_type');

		if (accessToken && refreshToken) {
			setIsProcessingMagicLink(true);
			try {
				// Establecer la sesión con los tokens
				const { data, error } = await supabase.auth.setSession({
					access_token: accessToken,
					refresh_token: refreshToken,
				});

				if (error) {
					console.error('Error al procesar magic link:', error);
					toast.error('Error al procesar el enlace de acceso');
				} else if (data.session) {
					const extendedUser = checkUserRole(data.session.user);
					setUser(extendedUser);
					toast.success('¡Sesión iniciada correctamente!');

					// Limpiar el hash de la URL
					window.history.replaceState(null, '', window.location.pathname + window.location.search);
				}
			} catch (error) {
				console.error('Error al procesar magic link:', error);
				toast.error('Error al procesar el enlace de acceso');
			} finally {
				setIsProcessingMagicLink(false);
			}
		}
	}, [checkUserRole]);

	useEffect(() => {
		// Procesar magic link al cargar la página
		processMagicLink();

		// Obtener sesión actual
		supabase.auth.getSession().then(({ data }) => {
			if (data.session?.user) {
				const extendedUser = checkUserRole(data.session.user);
				setUser(extendedUser);
			}
		});

		// Escuchar cambios en el estado de autenticación
		const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user) {
				const extendedUser = checkUserRole(session.user);
				setUser(extendedUser);
			} else {
				setUser(null);
			}
		});

		return () => {
			listener?.subscription.unsubscribe();
		};
	}, [processMagicLink, checkUserRole]);

	const login = async (email: string) => {
		setIsLoading(true);
		try {
			const { error } = await supabase.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: `${window.location.origin}${window.location.pathname}`
				}
			});

			if (error) {
				throw error;
			} else {
				toast.success('Enlace de acceso enviado a tu email');
			}
		} catch (error: any) {
			console.error('Error al enviar magic link:', error);
			toast.error(error.message || 'Error al enviar el enlace de acceso');
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		try {
			await supabase.auth.signOut();
			setUser(null);
			toast.success('Sesión cerrada correctamente');
		} catch (error) {
			console.error('Error al cerrar sesión:', error);
			toast.error('Error al cerrar sesión');
		}
	};

	// Función para actualizar el rol del usuario (solo para admins)
	const updateUserRole = async (userId: string, isAdmin: boolean) => {
		try {
			const { error } = await supabase.auth.admin.updateUserById(userId, {
				user_metadata: {
					role: isAdmin ? 'admin' : 'user',
					isAdmin: isAdmin
				}
			});

			if (error) throw error;

			// Actualizar el usuario local si es el usuario actual
			if (user?.id === userId) {
				const updatedUser = { ...user, isAdmin };
				setUser(updatedUser);
			}

			toast.success(`Usuario ${isAdmin ? 'promovido a administrador' : 'degradado a usuario'}`);
		} catch (error: any) {
			console.error('Error al actualizar rol:', error);
			toast.error('Error al actualizar el rol del usuario');
			throw error;
		}
	};

	return (
		<AuthContext.Provider value={{
			user,
			isLoggedIn: !!user,
			login,
			logout,
			isLoading,
			isProcessingMagicLink,
			updateUserRole
		}}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}