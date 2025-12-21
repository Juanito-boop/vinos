"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

type OrderStatusType = "pendiente" | "preparandose" | "listo para enviarse" | "enviandose" | "listo"

interface OrderStatusContextProps {
	userId: string | null
	setUserId: (id: string) => void
	orderStatus: OrderStatusType
	setOrderStatus: (status: OrderStatusType) => void
}

const OrderStatusContext = createContext<OrderStatusContextProps | undefined>(undefined)

interface OrderStatusProviderProps {
	children: ReactNode
}

export const OrderStatusProvider = ({ children }: OrderStatusProviderProps) => {
	const [userId, setUserIdState] = useState<string | null>(null)
	const [orderStatus, setOrderStatusState] = useState<OrderStatusType>("pendiente")

	// Función para obtener las claves de localStorage basadas en el userId
	const getStorageKeys = (id: string) => ({
		userIdKey: id,
		orderStatusKey: `wine-store-order-status-${id}`
	})

	// Cargar desde localStorage al iniciar
	useEffect(() => {
		// Buscar si hay algún userId guardado
		const keys = Object.keys(localStorage)
		const userIdKey = keys.find(key => key.startsWith('wine-store-user-id-'))
		
		if (userIdKey) {
			const storedUserId = localStorage.getItem(userIdKey)
			if (storedUserId) {
				setUserIdState(storedUserId)
				const { orderStatusKey } = getStorageKeys(storedUserId)
				const storedOrderStatus = localStorage.getItem(orderStatusKey) as OrderStatusType | null
				if (storedOrderStatus) setOrderStatusState(storedOrderStatus)
			}
		}
	}, [])

	// Guardar en localStorage cuando cambie el userId
	useEffect(() => {
		if (userId) {
			const { userIdKey } = getStorageKeys(userId)
			localStorage.setItem(userIdKey, userId)
		}
	}, [userId])

	// Guardar en localStorage cuando cambie el orderStatus
	useEffect(() => {
		if (userId && orderStatus) {
			const { orderStatusKey } = getStorageKeys(userId)
			localStorage.setItem(orderStatusKey, orderStatus)
		}
	}, [userId, orderStatus])

	const setUserId = (id: string) => setUserIdState(id)
	const setOrderStatus = (status: OrderStatusType) => setOrderStatusState(status)

	return (
		<OrderStatusContext.Provider value={{ userId, setUserId, orderStatus, setOrderStatus }}>
			{children}
		</OrderStatusContext.Provider>
	)
}

export function useOrderStatus() {
	const context = useContext(OrderStatusContext)
	if (!context) {
		throw new Error("useOrderStatus debe usarse dentro de un OrderStatusProvider")
	}
	return context
} 