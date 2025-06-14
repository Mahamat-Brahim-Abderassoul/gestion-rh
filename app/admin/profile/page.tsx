"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, User, Save, Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import apiService from "@/lib/api-service"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Charger les données du profil au montage du composant
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiService.auth.getProfile()
        if (response.success) {
          setFormData({
            nom: response.data.nom || "",
            prenom: response.data.prenom || "",
            email: response.data.email || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          })
        }
      } catch (error: any) {
        setStatus({
          type: "error",
          message: error.message || "Erreur lors du chargement du profil",
        })
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus(null)

    try {
      // Vérifier si les mots de passe correspondent
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setStatus({
          type: "error",
          message: "Les nouveaux mots de passe ne correspondent pas",
        })
        setIsLoading(false)
        return
      }

      // Préparer les données à envoyer
      const updateData: any = {}

      // Vérifier les changements
      if (formData.nom.trim()) updateData.nom = formData.nom.trim()
      if (formData.prenom.trim()) updateData.prenom = formData.prenom.trim()
      if (formData.email.trim()) updateData.email = formData.email.trim()

      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      // Si aucune modification n'est faite
      if (Object.keys(updateData).length === 0) {
        setStatus({
          type: "error",
          message: "Aucune modification à enregistrer",
        })
        setIsLoading(false)
        return
      }

      // Envoyer la requête de mise à jour
      const response = await apiService.auth.updateProfile(updateData)

      if (response.success) {
        setStatus({
          type: "success",
          message: "Profil mis à jour avec succès",
        })

        // Réinitialiser les champs de mot de passe
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))

        // Si l'email ou le mot de passe a été modifié, déconnecter l'utilisateur après 3 secondes
        if (updateData.email || updateData.newPassword) {
          setTimeout(() => {
            setStatus({
              type: "success",
              message: "Profil mis à jour. Reconnexion nécessaire...",
            })
            setTimeout(() => {
              logout()
              router.push("/admin/login")
            }, 2000)
          }, 1000)
        }
      }
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Erreur lors de la mise à jour du profil",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement du profil...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profil Administrateur</h1>
                <p className="text-sm text-gray-600">{user?.nomComplet || `${formData.prenom} ${formData.nom}`}</p>
              </div>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Modifier votre profil</CardTitle>
            <CardDescription>Mettez à jour vos informations personnelles et de connexion</CardDescription>
          </CardHeader>
          <CardContent>
            {status && (
              <Alert
                className={`mb-6 ${status.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
              >
                <AlertDescription className={status.type === "success" ? "text-green-800" : "text-red-800"}>
                  {status.message}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      name="nom"
                      type="text"
                      value={formData.nom}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      name="prenom"
                      type="text"
                      value={formData.prenom}
                      onChange={handleChange}
                      placeholder="Votre prénom"
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Informations de connexion */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de connexion</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Changement de mot de passe */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Laissez ces champs vides si vous ne souhaitez pas changer votre mot de passe
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="Votre mot de passe actuel"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Votre nouveau mot de passe"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Le mot de passe doit contenir au moins 6 caractères avec une minuscule, une majuscule et un
                      chiffre
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirmez votre nouveau mot de passe"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Boutons d'action */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>

                <Link href="/admin/dashboard">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
