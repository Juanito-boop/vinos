"use client"

import { useState } from "react"
import { Info, X, CheckCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Alert, AlertDescription } from "./ui/alert"
import { useURLDataDetector } from "@/hooks/use-url-data-detector"

export function URLPersistenceInfo() {
  const [isVisible, setIsVisible] = useState(true)
  const { hasCartData, hasFiltersData, hasAnyData } = useURLDataDetector()

  if (!isVisible) return null

  return (
    <Alert className={`mb-4 ${hasAnyData ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
      {hasAnyData ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <Info className="h-4 w-4 text-blue-600" />
      )}
      <AlertDescription className={hasAnyData ? 'text-green-800' : 'text-blue-800'}>
        <div className="flex items-center justify-between">
          <span>
            {hasAnyData ? (
              <>
                ✅ Datos recuperados de la URL: 
                {hasCartData && <span className="font-medium"> Carrito</span>}
                {hasCartData && hasFiltersData && <span> y </span>}
                {hasFiltersData && <span className="font-medium"> Filtros</span>}
                <span> restaurados correctamente.</span>
              </>
            ) : (
              <>
              Toast
                💾 Tus filtros y carrito se guardan automáticamente en la URL. 
                Puedes compartir el enlace o recargar la página sin perder tu progreso.
              </>
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className={`ml-2 h-6 w-6 p-0 ${hasAnyData ? 'text-green-600 hover:text-green-800' : 'text-blue-600 hover:text-blue-800'}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
} 