"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BarChart3, Users, TrendingUp, TrendingDown, AlertTriangle, Loader2 } from "lucide-react"
import { useEmployees } from "@/hooks/use-employees"

export default function StatisticsPage() {
  const { getStatistics } = useEmployees()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true)
        const data = await getStatistics()
        setStats(data)
        setError(null)
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des statistiques")
      } finally {
        setLoading(false)
      }
    }

    loadStatistics()
  }, [getStatistics])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement des statistiques...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Erreur</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Aucune donnée</CardTitle>
            <CardDescription className="text-center">Aucune statistique disponible pour le moment.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/admin/dashboard">
              <Button>Retour au Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { totalEmployees, generalStats, departmentStats, categoryStats, alerts } = stats

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Statistiques RH</h1>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vue d'ensemble */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Employés enregistrés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Congés moyens</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{generalStats.avgConges.toFixed(1)}j</div>
              <p className="text-xs text-muted-foreground">Par employé</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absences moyennes</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{generalStats.avgAbsences.toFixed(1)}j</div>
              <p className="text-xs text-muted-foreground">Par employé</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{alerts.total}</div>
              <p className="text-xs text-muted-foreground">Situations à surveiller</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Répartition par département */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par département</CardTitle>
              <CardDescription>Distribution des employés par département</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {departmentStats.map((dept: any) => (
                <div key={dept.departement} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{dept.departement}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{dept.count} employés</span>
                      <Badge variant="secondary">{dept.percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                  <Progress value={dept.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Statistiques par catégorie */}
          <Card>
            <CardHeader>
              <CardTitle>Analyse par catégorie</CardTitle>
              <CardDescription>Moyennes de congés et absences par catégorie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryStats.map((cat: any) => (
                <div key={cat.categorie} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">{cat.categorie}</h4>
                    <Badge variant="outline">{cat.count} employés</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Congés moyens</span>
                      <div className="font-medium text-green-600">{cat.avgConges}j</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Absences moyennes</span>
                      <div className="font-medium text-orange-600">{cat.avgAbsences}j</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Alertes et recommandations */}
        {(alerts.lowLeaveCount > 0 || alerts.highAbsenceCount > 0) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Alertes et recommandations
              </CardTitle>
              <CardDescription>Situations nécessitant une attention particulière</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.lowLeaveCount > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Congés faibles</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    {alerts.lowLeaveCount} employé(s) ont moins de 10 jours de congés restants. Considérez une
                    planification des congés.
                  </p>
                </div>
              )}

              {alerts.highAbsenceCount > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">Absences élevées</span>
                  </div>
                  <p className="text-sm text-red-700">
                    {alerts.highAbsenceCount} employé(s) ont plus de 10 jours d'absence. Un suivi individuel est
                    recommandé.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
