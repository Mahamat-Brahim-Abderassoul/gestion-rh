/**
 * Service pour gérer les appels API avec optimisations de performance et gestion des timeouts
 */

// URL de base de l'API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Cache pour les requêtes
const requestCache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Map pour éviter les requêtes en double
const pendingRequests = new Map<string, Promise<any>>()

/**
 * Obtenir le token JWT depuis le localStorage
 */
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

/**
 * Créer un AbortController avec timeout personnalisé
 */
const createTimeoutController = (timeoutMs = 30000) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  return { controller, timeoutId }
}

/**
 * Options par défaut pour fetch avec timeout amélioré
 */
const getDefaultOptions = (timeoutMs = 30000) => {
  const { controller, timeoutId } = createTimeoutController(timeoutMs)

  return {
    headers: {
      "Content-Type": "application/json",
    },
    signal: controller.signal,
    timeoutId, // Pour pouvoir nettoyer le timeout
  }
}

/**
 * Méthode générique pour les requêtes API avec gestion d'erreurs améliorée
 */
const apiRequest = async <T>(
  endpoint: string,
  method: string = "GET",
  data: any = null,
  requireAuth: boolean = true,
  useCache: boolean = true,
  timeoutMs: number = 30000 // 30 secondes par défaut
)
: Promise<T> =>
{
  // Créer une clé de cache
  const cacheKey = `${method}:${endpoint}:${JSON.stringify(data)}`
  const now = Date.now()

  // Vérifier le cache pour les requêtes GET
  if (method === "GET" && useCache) {
    const cached = requestCache.get(cacheKey)
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log("✅ Réponse trouvée dans le cache:", cacheKey)
      return cached.data
    }
  }

  // Vérifier s'il y a déjà une requête en cours pour éviter les doublons
  if (pendingRequests.has(cacheKey)) {
    console.log("⏳ Requête déjà en cours, attente:", cacheKey)
    return pendingRequests.get(cacheKey)!
  }

  // Construire l'URL complète
  const url = `${API_URL}${endpoint}`
  console.log(`🚀 API Request: ${method} ${url}`)

  // Préparer les options de la requête avec timeout personnalisé
  const options = getDefaultOptions(timeoutMs)
  const requestOptions: RequestInit = {
    method,
    headers: options.headers,
    signal: options.signal,
  }

  // Ajouter le token d'authentification si nécessaire
  if (requireAuth) {
    const token = getToken()
    if (token) {
      requestOptions.headers = {
        ...requestOptions.headers,
        Authorization: `Bearer ${token}`,
      }
    } else if (requireAuth) {
      // Rediriger vers la page de connexion si l'authentification est requise mais qu'il n'y a pas de token
      if (typeof window !== "undefined") {
        console.log("❌ API Service: Pas de token, redirection vers login")
        window.location.href = "/admin/login"
      }
      throw new Error("Authentification requise")
    }
  }

  // Ajouter les données si présentes
  if (data) {
    requestOptions.body = JSON.stringify(data)
  }

  // Créer la promesse de requête avec gestion d'erreurs améliorée
  const requestPromise = (async () => {
    let timeoutId: NodeJS.Timeout | undefined

    try {
      console.log("📡 API Service: Envoi de la requête...")

      // Démarrer un timer pour surveiller la durée
      const startTime = Date.now()

      // Faire la requête avec retry automatique
      let response: Response
      let attempt = 0
      const maxRetries = 3

      while (attempt < maxRetries) {
        try {
          // Créer un nouveau controller pour chaque tentative
          const { controller, timeoutId: newTimeoutId } = createTimeoutController(timeoutMs)
          timeoutId = newTimeoutId

          requestOptions.signal = controller.signal

          response = await fetch(url, requestOptions)

          // Nettoyer le timeout si la requête réussit
          if (timeoutId) {
            clearTimeout(timeoutId)
          }

          break // Sortir de la boucle si succès
        } catch (error: any) {
          attempt++

          // Nettoyer le timeout
          if (timeoutId) {
            clearTimeout(timeoutId)
          }

          console.warn(`⚠️ Tentative ${attempt}/${maxRetries} échouée:`, error.message)

          // Si c'est une erreur de timeout et qu'il reste des tentatives
          if ((error.name === "AbortError" || error.message.includes("timeout")) && attempt < maxRetries) {
            console.log(`🔄 Nouvelle tentative dans 1 seconde...`)
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)) // Délai progressif
            continue
          }

          // Si toutes les tentatives ont échoué
          if (attempt >= maxRetries) {
            if (error.name === "AbortError" || error.message.includes("timeout")) {
              throw new Error(`La requête a expiré après ${maxRetries} tentatives. Vérifiez votre connexion internet.`)
            }
            throw error
          }
        }
      }

      const endTime = Date.now()
      const duration = endTime - startTime
      console.log(`⏱️ API Service: Réponse reçue en ${duration}ms avec statut: ${response!.status}`)

      // Analyser la réponse JSON avec timeout
      let result: any
      try {
        const textResponse = await response!.text()
        result = textResponse ? JSON.parse(textResponse) : {}
      } catch (parseError) {
        console.error("❌ Erreur de parsing JSON:", parseError)
        throw new Error("Réponse du serveur invalide")
      }

      // Vérifier si la requête a réussi
      if (!response!.ok) {
        // Gérer les erreurs d'authentification
        if (response!.status === 401) {
          // Supprimer le token et rediriger vers la page de connexion
          if (typeof window !== "undefined") {
            console.log("🔐 API Service: Erreur 401, suppression du token")
            localStorage.removeItem("auth_token")
            window.location.href = "/admin/login"
          }
        }

        // Lancer une erreur avec les détails
        const errorMessage = result.message || `Erreur ${response!.status}: ${response!.statusText}`
        console.error("❌ API Service: Erreur de requête:", errorMessage)
        throw new Error(errorMessage)
      }

      // Mettre en cache les réponses GET réussies
      if (method === "GET" && useCache) {
        requestCache.set(cacheKey, { data: result, timestamp: now })

        // Nettoyer le cache périodiquement (garder seulement les 100 dernières entrées)
        if (requestCache.size > 100) {
          const entries = Array.from(requestCache.entries())
          entries.sort((a, b) => b[1].timestamp - a[1].timestamp)
          requestCache.clear()
          entries.slice(0, 50).forEach(([key, value]) => {
            requestCache.set(key, value)
          })
        }
      }

      console.log("✅ API Service: Requête réussie")
      return result
    } catch (error: any) {
      // Nettoyer le timeout en cas d'erreur
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      console.error("❌ API Service: Erreur:", error)

      // Améliorer les messages d'erreur
      if (error.name === "AbortError") {
        throw new Error("La requête a pris trop de temps. Vérifiez votre connexion internet.")
      }

      if (error.message.includes("Failed to fetch")) {
        throw new Error("Impossible de contacter le serveur. Vérifiez votre connexion internet.")
      }

      throw error
    } finally {
      // Supprimer la requête en cours
      pendingRequests.delete(cacheKey)
    }
  })()

  // Ajouter la promesse aux requêtes en cours
  pendingRequests.set(cacheKey, requestPromise)

  return requestPromise
}

/**
 * Fonction pour vider le cache
 */
const clearCache = () => {
  requestCache.clear()
  pendingRequests.clear()
  console.log("🧹 Cache API vidé")
}

/**
 * Fonction pour tester la connectivité
 */
const testConnection = async (): Promise<boolean> => {
  try {
    console.log("🔍 Test de connectivité...")
    await apiRequest<any>("/health", "GET", null, false, false, 5000) // 5 secondes timeout
    console.log("✅ Connectivité OK")
    return true
  } catch (error) {
    console.error("❌ Test de connectivité échoué:", error)
    return false
  }
}

/**
 * Service API pour les requêtes avec timeouts optimisés
 */
const apiService = {
  // Méthodes pour l'authentification
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiRequest<{ success: boolean; token: string; user: any }>(
        "/auth/login",
        "POST",
        credentials,
        false,
        false,
        15000, // 15 secondes pour le login
      ),

    getProfile: () =>
      apiRequest<{ success: boolean; data: any }>(
        "/auth/profile",
        "GET",
        null,
        true,
        true,
        10000, // 10 secondes
      ),

    updateProfile: (data: {
      nom?: string
      prenom?: string
      email?: string
      currentPassword?: string
      newPassword?: string
    }) =>
      apiRequest<{ success: boolean; message: string; data: any }>(
        "/auth/profile",
        "PUT",
        data,
        true,
        false,
        15000, // 15 secondes pour la mise à jour
      ),
  },

  // Méthodes pour les employés
  employees: {
    getAll: (params?: {
      page?: number
      limit?: number
      search?: string
      field?: string
      sortBy?: string
      sortOrder?: string
    }) => {
      // Construire la chaîne de requête
      const queryParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString())
          }
        })
      }

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

      return apiRequest<{ success: boolean; data: any[]; pagination: any }>(
        `/employees${queryString}`,
        "GET",
        null,
        true,
        true,
        20000, // 20 secondes pour la liste
      )
    },

    getById: (id: string) =>
      apiRequest<{ success: boolean; data: any }>(
        `/employees/${id}`,
        "GET",
        null,
        true,
        true,
        10000, // 10 secondes
      ),

    create: (data: any) =>
      apiRequest<{ success: boolean; data: any; message: string }>(
        "/employees",
        "POST",
        data,
        true,
        false,
        15000, // 15 secondes pour la création
      ),

    update: (id: string, data: any) =>
      apiRequest<{ success: boolean; data: any; message: string }>(
        `/employees/${id}`,
        "PUT",
        data,
        true,
        false,
        15000, // 15 secondes pour la mise à jour
      ),

    delete: (id: string) =>
      apiRequest<{ success: boolean; message: string }>(
        `/employees/${id}`,
        "DELETE",
        null,
        true,
        false,
        10000, // 10 secondes pour la suppression
      ),

    getStats: () =>
      apiRequest<{ success: boolean; data: any }>(
        "/employees/stats",
        "GET",
        null,
        true,
        true,
        15000, // 15 secondes pour les stats
      ),
  },

  // Utilitaires
  clearCache,
  testConnection,
}

export default apiService
