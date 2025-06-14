import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Search, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">GestionRH</h1>
            </div>
            <Link href="/admin/login">
              <Button variant="outline" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Connexion Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Système de Gestion des Ressources Humaines
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une solution complète pour gérer les employés, leurs congés, autorisations et informations personnelles
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Gestion des Employés</CardTitle>
              <CardDescription>Ajoutez, modifiez et gérez toutes les informations des employés</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Matricule, diplômes, départements, catégories et plus encore</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Search className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Recherche Avancée</CardTitle>
              <CardDescription>Trouvez rapidement les employés par différents critères</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Recherche par nom, matricule, département ou tout autre champ</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Suivi des Congés</CardTitle>
              <CardDescription>Gérez les congés et autorisations des employés</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Congés restants, autorisations et suivi des absences</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900">Prêt à commencer ?</CardTitle>
              <CardDescription className="text-blue-700">
                Connectez-vous en tant qu'administrateur pour accéder au système de gestion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Accéder au Système
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 GestionRH. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
