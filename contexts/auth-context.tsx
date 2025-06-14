"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import apiService from "@/lib/api-service"

// Types
interface User {
  id: string
  nom: string
  prenom: string
  email: string
  role: string
  nomComplet: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  }
  return context
}

// Provider du contexte
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Fonction pour rafraîchir les données utilisateur
  const refreshUser = async () => {
    try {
      const response = await apiService.auth.getProfile()
      if (response.success) {
        setUser(response.data)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du profil:", error)
      localStorage.removeItem("auth_token")
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token")

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        await refreshUser()
      } catch (error) {
        console.error("Erreur de vérification d'authentification:", error)
        localStorage.removeItem("auth_token")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      console.log("AuthContext: Tentative de connexion à l'API...")
      const response = await apiService.auth.login({ email, password })
      console.log("AuthContext: Réponse de l'API:", response)

      if (response.success) {
        console.log("AuthContext: Connexion réussie, stockage du token...")
        localStorage.setItem("auth_token", response.token)
        setUser(response.user)
        setIsAuthenticated(true)
        console.log("AuthContext: État d'authentification mis à jour")
      }
    } catch (error) {
      console.error("AuthContext: Erreur de connexion:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
    setIsAuthenticated(false)
  }

  // Valeur du contexte
  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
