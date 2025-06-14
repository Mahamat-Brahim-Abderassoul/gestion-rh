"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowLeft,
  Filter,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { useEmployees } from "@/hooks/use-employees"
import { exportEmployeesToExcel } from "@/lib/excel-export"
import { ConnectionStatus } from "@/components/connection-status"
import type { Employee } from "@/types/employee"

export default function EmployeesListPage() {
  const { employees, isLoading, error, pagination, loadEmployees, deleteEmployee, testConnection } = useEmployees()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchField, setSearchField] = useState<string>("all")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; employee: Employee | null }>({
    open: false,
    employee: null,
  })
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Charger les employés au montage du composant
  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  // Debounce pour la recherche (optimisation performance)
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string, field: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          loadEmployees({
            search: query,
            field: field === "all" ? undefined : field,
          })
        }, 300) // Réduit de 500ms à 300ms pour plus de réactivité
      }
    })(),
    [loadEmployees],
  )

  // Filtrer les employés quand la recherche change
  useEffect(() => {
    debouncedSearch(searchQuery, searchField)
  }, [searchQuery, searchField, debouncedSearch])

  // Fonction de retry avec backoff exponentiel
  const retryWithBackoff = useCallback(async () => {
    const maxRetries = 3
    if (retryCount >= maxRetries) {
      setAlert({
        type: "error",
        message: "Impossible de charger les données après plusieurs tentatives. Vérifiez votre connexion.",
      })
      return
    }

    setRetryCount((prev) => prev + 1)

    // Délai progressif : 1s, 2s, 4s
    const delay = Math.pow(2, retryCount) * 1000

    setAlert({
      type: "error",
      message: `Nouvelle tentative dans ${delay / 1000} seconde(s)...`,
    })

    setTimeout(() => {
      loadEmployees()
    }, delay)
  }, [retryCount, loadEmployees])

  // Réinitialiser le compteur de retry en cas de succès
  useEffect(() => {
    if (!error && !isLoading) {
      setRetryCount(0)
    }
  }, [error, isLoading])

  // Mémoriser les fonctions pour éviter les re-renders
  const handleDelete = useCallback(
    async (employee: Employee) => {
      try {
        const employeeId = employee.id || employee._id
        if (!employeeId) {
          throw new Error("Employee ID is undefined")
        }
        const success = await deleteEmployee(employeeId)

        if (success) {
          loadEmployees()
          setAlert({
            type: "success",
            message: `Employé ${employee.prenom} ${employee.nom} supprimé avec succès`,
          })
          setTimeout(() => setAlert(null), 3000)
        } else {
          setAlert({
            type: "error",
            message: "Erreur lors de la suppression",
          })
        }
      } catch (error: any) {
        let errorMessage = "Erreur lors de la suppression"

        if (error.message.includes("timeout")) {
          errorMessage = "La suppression a pris trop de temps. Réessayez."
        } else if (error.message) {
          errorMessage = error.message
        }

        setAlert({
          type: "error",
          message: errorMessage,
        })
      }
      setDeleteDialog({ open: false, employee: null })
    },
    [deleteEmployee, loadEmployees],
  )

  const handleExportToExcel = useCallback(async () => {
    setIsExporting(true)

    try {
      const result = exportEmployeesToExcel(employees, "liste_employes")

      if (result.success) {
        setAlert({
          type: "success",
          message: `Fichier Excel exporté avec succès ! ${result.recordCount} employé(s) exporté(s) dans ${result.filename}`,
        })
        setTimeout(() => setAlert(null), 5000)
      } else {
        setAlert({
          type: "error",
          message: `Erreur lors de l'exportation : ${result.error}`,
        })
        setTimeout(() => setAlert(null), 5000)
      }
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.message || "Erreur lors de l'exportation Excel",
      })
      setTimeout(() => setAlert(null), 5000)
    } finally {
      setIsExporting(false)
    }
  }, [employees])

  // Fonction pour forcer le rechargement
  const handleForceReload = useCallback(() => {
    setRetryCount(0)
    setAlert(null)
    loadEmployees()
  }, [loadEmployees])

  // Mémoriser la fonction getBadgeVariant
  const getBadgeVariant = useCallback((value: number, type: "conges" | "autorisations") => {
    if (type === "conges") {
      if (value > 20) return "default"
      if (value > 10) return "secondary"
      return "destructive"
    } else {
      if (value > 7) return "default"
      if (value > 3) return "secondary"
      return "destructive"
    }
  }, [])

  // Mémoriser les employés rendus pour éviter les re-renders
  const renderedEmployees = useMemo(() => {
    return employees.map((employee) => {
      const employeeId = employee.id || employee._id
      return (
        <TableRow key={employeeId}>
          <TableCell className="font-medium">{employee.matricule}</TableCell>
          <TableCell>
            <div>
              <div className="font-medium">
                {employee.nom} {employee.prenom}
              </div>
              <div className="text-sm text-gray-500">{employee.diplome}</div>
            </div>
          </TableCell>
          <TableCell>{employee.telephone}</TableCell>
          <TableCell>{employee.departement}</TableCell>
          <TableCell>
            <Badge variant="outline">{employee.categorie}</Badge>
          </TableCell>
          <TableCell>
            <Badge variant={getBadgeVariant(employee.congesRestants, "conges")}>{employee.congesRestants}j</Badge>
          </TableCell>
          <TableCell>
            <div className="space-y-1">
              <Badge variant={getBadgeVariant(employee.autorisationRestante, "autorisations")} className="text-xs">
                R: {employee.autorisationRestante}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                E: {employee.autorisationEcoulee}
              </Badge>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant={employee.absence > 5 ? "destructive" : "secondary"}>{employee.absence}j</Badge>
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href={`/admin/employees/view/${employeeId}`}>
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir détails
                  </DropdownMenuItem>
                </Link>
                <Link href={`/admin/employees/edit/${employeeId}`}>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="text-red-600" onClick={() => setDeleteDialog({ open: true, employee })}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      )
    })
  }, [employees, getBadgeVariant])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Liste des Employés</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/employees/add">
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Ajouter un Employé
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status de connexion */}
        <ConnectionStatus />

        {/* Alertes */}
        {alert && (
          <Alert
            className={`mb-6 ${alert.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            <div className="flex items-center gap-2">
              {alert.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={alert.type === "success" ? "text-green-800" : "text-red-800"}>
                {alert.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Erreur avec option de retry */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 flex items-center justify-between">
              <div>
                <div>{error}</div>
                {retryCount > 0 && <div className="text-xs mt-1">Tentative {retryCount}/3</div>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={retryWithBackoff} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Réessayer
                </Button>
                <Button variant="outline" size="sm" onClick={handleForceReload} disabled={isLoading}>
                  Forcer le rechargement
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employés ({pagination.total || 0})
                </CardTitle>
                <CardDescription>Gérez tous vos employés et leurs informations</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportToExcel}
                  disabled={isExporting || employees.length === 0}
                  className="flex items-center gap-2"
                >
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                  {isExporting ? "Export en cours..." : "Exporter XLSX"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleForceReload} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Actualiser
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Barre de recherche et filtres */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un employé..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les champs</SelectItem>
                  <SelectItem value="nom">Nom</SelectItem>
                  <SelectItem value="prenom">Prénom</SelectItem>
                  <SelectItem value="matricule">Matricule</SelectItem>
                  <SelectItem value="departement">Département</SelectItem>
                  <SelectItem value="categorie">Catégorie</SelectItem>
                  <SelectItem value="diplome">Diplôme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* État de chargement */}
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
                <span>Chargement des données...</span>
              </div>
            )}

            {/* Tableau des employés */}
            {!isLoading && employees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "Aucun employé trouvé" : "Aucun employé enregistré"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? "Essayez de modifier votre recherche ou vos filtres"
                    : "Commencez par ajouter votre premier employé"}
                </p>
                {!searchQuery && (
                  <Link href="/admin/employees/add">
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Ajouter un Employé
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matricule</TableHead>
                      <TableHead>Nom & Prénom</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Département</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Congés</TableHead>
                      <TableHead>Autorisations</TableHead>
                      <TableHead>Absences</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderedEmployees}</TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && employees.length > 0 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500">
                  Affichage de {(pagination.page - 1) * pagination.limit + 1} à{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} employés
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1 || isLoading}
                    onClick={() =>
                      loadEmployees({
                        page: pagination.page - 1,
                        search: searchQuery,
                        field: searchField === "all" ? undefined : searchField,
                      })
                    }
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.pages || isLoading}
                    onClick={() =>
                      loadEmployees({
                        page: pagination.page + 1,
                        search: searchQuery,
                        field: searchField === "all" ? undefined : searchField,
                      })
                    }
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de confirmation de suppression */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, employee: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer l'employé{" "}
                <strong>
                  {deleteDialog.employee?.prenom} {deleteDialog.employee?.nom}
                </strong>{" "}
                ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialog({ open: false, employee: null })}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteDialog.employee && handleDelete(deleteDialog.employee)}
              >
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
