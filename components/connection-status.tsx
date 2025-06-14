"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import apiService from "@/lib/api-service"

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const isConnected = await apiService.testConnection()
      setIsOnline(isConnected)
      setLastCheck(new Date())
    } catch (error) {
      setIsOnline(false)
      setLastCheck(new Date())
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Vérifier la connexion au montage
    checkConnection()

    // Vérifier périodiquement
    const interval = setInterval(checkConnection, 30000) // Toutes les 30 secondes

    // Écouter les événements de connexion du navigateur
    const handleOnline = () => {
      setIsOnline(true)
      checkConnection()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline) {
    return null // Ne rien afficher si tout va bien
  }

  return (
    <Alert className="border-red-200 bg-red-50 mb-4">
      <WifiOff className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800 flex items-center justify-between">
        <span>
          Problème de connexion détecté. Certaines fonctionnalités peuvent être indisponibles.
          {lastCheck && (
            <span className="text-xs block mt-1">Dernière vérification : {lastCheck.toLocaleTimeString()}</span>
          )}
        </span>
        <Button variant="outline" size="sm" onClick={checkConnection} disabled={isChecking} className="ml-4">
          {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
          {isChecking ? "Vérification..." : "Réessayer"}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
