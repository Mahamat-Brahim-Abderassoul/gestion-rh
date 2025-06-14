"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  User,
  Phone,
  GraduationCap,
  Building,
  Calendar,
  Clock,
  UserX,
  Edit,
  Loader2,
  Mail,
  MapPin,
  FileSpreadsheet,
  CheckCircle,
} from "lucide-react"
import { useEmployees } from "@/hooks/use-employees"
import { exportSingleEmployeeToExcel } from "@/lib/excel-export"
import type { Employee } from "@/types/employee"

export default function ViewEmployeePage() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const params = useParams()
  const employeeId = params.id as string
  const { getEmployee } = useEmployees()

  useEffect(() => {
    const loadEmployee = async () => {
      if (!employeeId) {
        setError("ID d'employé manquant")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        console.log("Chargement de l'employé avec ID:", employeeId)

        const employeeData = await getEmployee(employeeId)

        if (employeeData) {
          setEmployee(employeeData)
          console.log("Employé chargé:", employeeData)
        } else {
          setError("Employé non trouvé")
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement de l'employé:", err)
        setError(err.message || "Erreur lors du chargement de l'employé")
      } finally {
        setLoading(false)
      }
    }

    loadEmployee()
  }, [employeeId, getEmployee])

  const handleExportEmployee = async () => {
    if (!employee) return

    setIsExporting(true)
    setExportStatus(null)

    try {
      const result = exportSingleEmployeeToExcel(employee)

      if (result.success) {
        setExportStatus({
          type: "success",
          message: `Fiche employé exportée avec succès dans ${result.filename}`,
        })
        setTimeout(() => setExportStatus(null), 5000)
      } else {
        setExportStatus({
          type: "error",
          message: `Erreur lors de l'exportation : ${result.error}`,
        })
        setTimeout(() => setExportStatus(null), 5000)
      }
    } catch (error: any) {
      setExportStatus({
        type: "error",
        message: error.message || "Erreur lors de l'exportation",
      })
      setTimeout(() => setExportStatus(null), 5000)
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Employé non trouvé</CardTitle>
            <CardDescription className="text-center">
              {error || "L'employé que vous cherchez n'existe pas ou a été supprimé."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-500">ID recherché: {employeeId}</p>
            <div className="flex gap-2 justify-center">
              <Link href="/admin/employees">
                <Button>Retour à la liste</Button>
              </Link>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getBadgeVariant = (value: number, type: "conges" | "autorisations") => {
    if (type === "conges") {
      if (value > 20) return "default"
      if (value > 10) return "secondary"
      return "destructive"
    } else {
      if (value > 7) return "default"
      if (value > 3) return "secondary"
      return "destructive"
    }
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {employee.prenom} {employee.nom}
                </h1>
                <p className="text-sm text-gray-600">{employee.matricule}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportEmployee}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                {isExporting ? "Export..." : "Exporter XLSX"}
              </Button>
              <Link href={`/admin/employees/edit/${employee.id}`}>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </Link>
              <Link href="/admin/employees">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la Liste
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status d'exportation */}
        {exportStatus && (
          <Alert
            className={`mb-6 ${exportStatus.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            <div className="flex items-center gap-2">
              {exportStatus.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
              <AlertDescription className={exportStatus.type === "success" ? "text-green-800" : "text-red-800"}>
                {exportStatus.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Nom complet</p>
                      <p className="font-medium">
                        {employee.nom} {employee.prenom}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-medium">{employee.telephone}</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Mois</p>
                      <p className="font-medium">{employee.mois}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Diplôme</p>
                      <p className="font-medium">{employee.diplome}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations professionnelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informations professionnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Département</p>
                      <p className="font-medium">{employee.departement}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Catégorie</p>
                      <Badge variant="outline">{employee.categorie}</Badge>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Matricule</p>
                    <p className="font-medium font-mono">{employee.matricule}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historique des modifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Historique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date de création</p>
                    <p className="font-medium">
                      {new Date(employee.createdAt || employee.dateCreation || Date.now()).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(employee.createdAt || employee.dateCreation || Date.now()).toLocaleTimeString("fr-FR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dernière modification</p>
                    <p className="font-medium">
                      {new Date(employee.updatedAt ?? employee.dateModification ?? Date.now()).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(employee.updatedAt ?? employee.dateModification ?? Date.now()).toLocaleTimeString("fr-FR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar avec statistiques */}
          <div className="space-y-6">
            {/* Congés */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Congés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    <Badge variant={getBadgeVariant(employee.congesRestants, "conges")} className="text-lg px-3 py-1">
                      {employee.congesRestants}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">jours restants</p>
                </div>
              </CardContent>
            </Card>

            {/* Autorisations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Autorisations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Restantes</span>
                  <Badge variant={getBadgeVariant(employee.autorisationRestante, "autorisations")}>
                    {employee.autorisationRestante}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Écoulées</span>
                  <Badge variant="secondary">{employee.autorisationEcoulee}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-medium">
                  <span className="text-sm">Total utilisé</span>
                  <span>{employee.autorisationRestante + employee.autorisationEcoulee}</span>
                </div>
              </CardContent>
            </Card>

            {/* Absences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="h-5 w-5" />
                  Absences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    <Badge variant={employee.absence > 5 ? "destructive" : "secondary"} className="text-lg px-3 py-1">
                      {employee.absence}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">jours d'absence</p>
                  {employee.absence > 10 && (
                    <Alert className="mt-4 border-orange-200 bg-orange-50">
                      <AlertDescription className="text-orange-800 text-xs">
                        Nombre d'absences élevé - Suivi recommandé
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/admin/employees/edit/${employee.id || employee._id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier les informations
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportEmployee}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                  )}
                  {isExporting ? "Export en cours..." : "Exporter en XLSX"}
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un email
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Calendar className="h-4 w-4 mr-2" />
                  Gérer les congés
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
