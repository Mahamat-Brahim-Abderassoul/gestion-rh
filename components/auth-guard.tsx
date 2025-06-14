"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Si l'authentification est déjà vérifiée et que l'utilisateur n'est pas authentifié
    if (!isLoading && !isAuthenticated) {
      console.log("AuthGuard: Utilisateur non authentifié, redirection vers login")
      router.push("/admin/login")
    } else if (!isLoading) {
      setIsChecking(false)
    }
  }, [isAuthenticated, isLoading, router])

  // Afficher un indicateur de chargement pendant la vérification
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Si l'utilisateur est authentifié, afficher le contenu
  return <>{children}</>
}
