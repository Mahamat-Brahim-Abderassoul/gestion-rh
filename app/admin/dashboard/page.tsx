"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, FileText, Calendar, Clock, LogOut, Home, BarChart3, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [stats] = useState({
    totalEmployees: 156,
    newThisMonth: 8,
    onLeave: 12,
    pendingRequests: 5,
  })

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Admin</h1>
                {user && (
                  <p className="text-sm text-gray-600">Bienvenue, {user.nomComplet || `${user.prenom} ${user.nom}`}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/profile">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Accueil
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue, {user?.nomComplet || "Administrateur"}</h2>
          <p className="text-gray-600">Gérez efficacement vos employés et leurs informations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Employés actifs dans le système</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nouveaux ce mois</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.newThisMonth}</div>
              <p className="text-xs text-muted-foreground">Nouvelles embauches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En congé</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.onLeave}</div>
              <p className="text-xs text-muted-foreground">Employés actuellement en congé</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes en attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Autorisations à traiter</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <UserPlus className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Ajouter un Employé</CardTitle>
              <CardDescription>Enregistrer un nouveau membre du personnel</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/employees/add">
                <Button className="w-full">Nouveau Employé</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Liste des Employés</CardTitle>
              <CardDescription>Voir et gérer tous les employés</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/employees">
                <Button variant="outline" className="w-full">
                  Voir la Liste
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-indigo-600 mb-2" />
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Analyses et rapports détaillés</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/statistics">
                <Button variant="outline" className="w-full">
                  Voir les Stats
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <User className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Mon Profil</CardTitle>
              <CardDescription>Modifier mes informations personnelles</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/profile">
                <Button variant="outline" className="w-full">
                  Gérer le Profil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>Dernières actions effectuées dans le système</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Nouvel employé ajouté</p>
                    <p className="text-sm text-gray-600">Marie Dubois - Département IT</p>
                  </div>
                </div>
                <Badge variant="secondary">Il y a 2h</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Congé approuvé</p>
                    <p className="text-sm text-gray-600">Jean Martin - 5 jours</p>
                  </div>
                </div>
                <Badge variant="secondary">Il y a 4h</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Profil mis à jour</p>
                    <p className="text-sm text-gray-600">Sophie Laurent - Informations de contact</p>
                  </div>
                </div>
                <Badge variant="secondary">Hier</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
