"use client"

import { useState, useCallback, useMemo } from "react"
import apiService from "@/lib/api-service"
import type { Employee } from "@/types/employee"

interface UseEmployeesOptions {
  initialPage?: number
  initialLimit?: number
}

interface EmployeesState {
  employees: Employee[]
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Cache pour les employés avec TTL
const employeeCache = new Map<string, { data: Employee; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useEmployees(options: UseEmployeesOptions = {}) {
  const { initialPage = 1, initialLimit = 10 } = options

  const [state, setState] = useState<EmployeesState>({
    employees: [],
    isLoading: false,
    error: null,
    pagination: {
      page: initialPage,
      limit: initialLimit,
      total: 0,
      pages: 0,
    },
  })

  // Cache pour les requêtes de liste
  const listCache = useMemo(() => new Map<string, { data: any; timestamp: number }>(), [])

  // Charger les employés avec gestion d'erreurs améliorée
  const loadEmployees = useCallback(
    async (params?: {
      page?: number
      limit?: number
      search?: string
      field?: string
      sortBy?: string
      sortOrder?: string
    }) => {
      // Créer une clé de cache basée sur les paramètres
      const cacheKey = JSON.stringify(params || {})
      const cached = listCache.get(cacheKey)
      const now = Date.now()

      // Vérifier le cache
      if (cached && now - cached.timestamp < CACHE_DURATION) {
        setState({
          employees: cached.data.data,
          isLoading: false,
          error: null,
          pagination: cached.data.pagination,
        })
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        console.log("🔄 Chargement des employés...")
        const response = await apiService.employees.getAll(params)

        if (response.success) {
          // Mettre en cache la réponse
          listCache.set(cacheKey, { data: response, timestamp: now })

          // Mettre en cache les employés individuels
          response.data.forEach((employee: Employee) => {
            const employeeId = employee.id || employee._id
            if (employeeId) {
              employeeCache.set(employeeId, { data: employee, timestamp: now })
            }
          })

          setState({
            employees: response.data,
            isLoading: false,
            error: null,
            pagination: response.pagination,
          })

          console.log(`✅ ${response.data.length} employés chargés`)
        }
      } catch (error: any) {
        console.error("❌ Erreur lors du chargement des employés:", error)

        let errorMessage = "Erreur lors du chargement des employés"

        if (error.message.includes("timeout") || error.message.includes("timed out")) {
          errorMessage = "La requête a pris trop de temps. Vérifiez votre connexion internet."
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Impossible de contacter le serveur. Vérifiez votre connexion."
        } else if (error.message) {
          errorMessage = error.message
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))
      }
    },
    [listCache],
  )

  // Obtenir un employé par ID avec retry
  const getEmployee = useCallback(async (id: string) => {
    // Vérifier le cache d'abord
    const cached = employeeCache.get(id)
    const now = Date.now()

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log("✅ Employé trouvé dans le cache:", cached.data)
      return cached.data
    }

    try {
      console.log("🔄 Chargement de l'employé depuis l'API:", id)
      const response = await apiService.employees.getById(id)

      if (response.success && response.data) {
        // Mettre en cache
        employeeCache.set(id, { data: response.data, timestamp: now })
        console.log("✅ Employé chargé et mis en cache:", response.data)
        return response.data
      } else {
        console.log("❌ Employé non trouvé dans la réponse API")
        return null
      }
    } catch (error: any) {
      console.error("❌ Erreur lors du chargement de l'employé:", error)

      // Améliorer le message d'erreur
      if (error.message.includes("timeout")) {
        throw new Error("La requête a pris trop de temps. Réessayez.")
      }

      throw error
    }
  }, [])

  // Créer un employé avec retry
  const createEmployee = useCallback(
    async (data: Omit<Employee, "id" | "dateCreation" | "dateModification">) => {
      try {
        console.log("🔄 Création d'un nouvel employé...")
        const response = await apiService.employees.create(data)

        if (response.success) {
          // Invalider le cache de liste
          listCache.clear()
          console.log("✅ Employé créé avec succès")
          return response.data
        }
        return null
      } catch (error: any) {
        console.error("❌ Erreur lors de la création:", error)

        if (error.message.includes("timeout")) {
          throw new Error("La création a pris trop de temps. Réessayez.")
        }

        throw error
      }
    },
    [listCache],
  )

  // Mettre à jour un employé avec retry
  const updateEmployee = useCallback(
    async (id: string, data: Partial<Employee>) => {
      try {
        console.log("🔄 Mise à jour de l'employé:", id)
        const response = await apiService.employees.update(id, data)

        if (response.success) {
          // Invalider les caches
          employeeCache.delete(id)
          listCache.clear()
          console.log("✅ Employé mis à jour avec succès")
          return response.data
        }
        return null
      } catch (error: any) {
        console.error("❌ Erreur lors de la mise à jour:", error)

        if (error.message.includes("timeout")) {
          throw new Error("La mise à jour a pris trop de temps. Réessayez.")
        }

        throw error
      }
    },
    [listCache],
  )

  // Supprimer un employé avec retry
  const deleteEmployee = useCallback(
    async (id: string) => {
      try {
        console.log("🔄 Suppression de l'employé:", id)
        const response = await apiService.employees.delete(id)

        if (response.success) {
          // Invalider les caches
          employeeCache.delete(id)
          listCache.clear()
          console.log("✅ Employé supprimé avec succès")
          return true
        }
        return false
      } catch (error: any) {
        console.error("❌ Erreur lors de la suppression:", error)

        if (error.message.includes("timeout")) {
          throw new Error("La suppression a pris trop de temps. Réessayez.")
        }

        throw error
      }
    },
    [listCache],
  )

  // Obtenir les statistiques avec retry
  const getStatistics = useCallback(async () => {
    try {
      console.log("🔄 Chargement des statistiques...")
      const response = await apiService.employees.getStats()
      console.log("✅ Statistiques chargées")
      return response.success ? response.data : null
    } catch (error: any) {
      console.error("❌ Erreur lors du chargement des statistiques:", error)

      if (error.message.includes("timeout")) {
        throw new Error("Le chargement des statistiques a pris trop de temps. Réessayez.")
      }

      throw error
    }
  }, [])

  // Fonction pour vider le cache manuellement
  const clearCache = useCallback(() => {
    employeeCache.clear()
    listCache.clear()
    console.log("🧹 Cache des employés vidé")
  }, [listCache])

  // Fonction pour tester la connectivité
  const testConnection = useCallback(async () => {
    try {
      const isConnected = await apiService.testConnection()
      return isConnected
    } catch (error) {
      return false
    }
  }, [])

  return {
    ...state,
    loadEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getStatistics,
    clearCache,
    testConnection,
  }
}
