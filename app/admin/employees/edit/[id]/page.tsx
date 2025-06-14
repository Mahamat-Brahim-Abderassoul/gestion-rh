"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Edit, Save, Loader2 } from "lucide-react"
import { employeeValidationSchema } from "@/lib/validation"
import { useEmployees } from "@/hooks/use-employees"
import type { Employee, EmployeeFormData } from "@/types/employee"

const moisOptions = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

const diplomeOptions = ["Baccalauréat", "BTS", "DUT", "Licence", "Master", "Doctorat", "Ingénieur", "Autre"]

// Nouvelles catégories mises à jour
const categorieOptions = ["Chef de département", "Agent", "Directeur", "Directeur Adjoint", "Directrice"]

// Nouveaux départements mis à jour
const departementOptions = ["Communication", "Finance", "Général", "GRH", "Juridique", "Planification"]

export default function EditEmployeePage() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string
  const { getEmployee, updateEmployee } = useEmployees()

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
        const emp = await getEmployee(employeeId)

        if (emp) {
          setEmployee(emp)
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

  const handleSubmit = async (values: EmployeeFormData, { setSubmitting }: any) => {
    try {
      const updatedEmployee = await updateEmployee(employeeId, values)

      if (updatedEmployee) {
        setSubmitStatus({
          type: "success",
          message: `Employé ${updatedEmployee.prenom} ${updatedEmployee.nom} modifié avec succès !`,
        })

        // Rediriger vers la liste après 2 secondes
        setTimeout(() => {
          router.push("/admin/employees")
        }, 2000)
      } else {
        setSubmitStatus({
          type: "error",
          message: "Erreur lors de la modification de l'employé.",
        })
      }
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message: error.message || "Erreur lors de la modification de l'employé. Veuillez réessayer.",
      })
    } finally {
      setSubmitting(false)
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
          <CardContent className="text-center">
            <Link href="/admin/employees">
              <Button>Retour à la liste</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const initialValues: EmployeeFormData = {
    mois: employee.mois,
    nom: employee.nom,
    prenom: employee.prenom,
    telephone: employee.telephone,
    matricule: employee.matricule,
    diplome: employee.diplome,
    categorie: employee.categorie,
    departement: employee.departement,
    congesRestants: employee.congesRestants,
    autorisationRestante: employee.autorisationRestante,
    autorisationEcoulee: employee.autorisationEcoulee,
    absence: employee.absence,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Edit className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Modifier l'Employé</h1>
                <p className="text-sm text-gray-600">
                  {employee.prenom} {employee.nom} - {employee.matricule}
                </p>
              </div>
            </div>
            <Link href="/admin/employees">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la Liste
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Modifier les informations
            </CardTitle>
            <CardDescription>
              Modifiez les informations de l'employé. Tous les champs marqués d'un * sont obligatoires.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitStatus && (
              <Alert
                className={`mb-6 ${submitStatus.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
              >
                <AlertDescription className={submitStatus.type === "success" ? "text-green-800" : "text-red-800"}>
                  {submitStatus.message}
                </AlertDescription>
              </Alert>
            )}

            <Formik initialValues={initialValues} validationSchema={employeeValidationSchema} onSubmit={handleSubmit}>
              {({ isSubmitting, setFieldValue, values }) => (
                <Form className="space-y-6">
                  {/* Informations personnelles */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="mois">Mois *</Label>
                      <Select value={values.mois} onValueChange={(value) => setFieldValue("mois", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le mois" />
                        </SelectTrigger>
                        <SelectContent>
                          {moisOptions.map((mois) => (
                            <SelectItem key={mois} value={mois}>
                              {mois}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ErrorMessage name="mois" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="matricule">Matricule *</Label>
                      <Field as={Input} id="matricule" name="matricule" placeholder="Ex: EMP001" />
                      <ErrorMessage name="matricule" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom *</Label>
                      <Field as={Input} id="nom" name="nom" placeholder="Nom de famille" />
                      <ErrorMessage name="nom" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom *</Label>
                      <Field as={Input} id="prenom" name="prenom" placeholder="Prénom" />
                      <ErrorMessage name="prenom" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Numéro de téléphone *</Label>
                    <Field as={Input} id="telephone" name="telephone" placeholder="Ex: +33 1 23 45 67 89" />
                    <ErrorMessage name="telephone" component="div" className="text-red-500 text-sm" />
                  </div>

                  {/* Informations professionnelles */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="diplome">Diplôme *</Label>
                      <Select value={values.diplome} onValueChange={(value) => setFieldValue("diplome", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le diplôme" />
                        </SelectTrigger>
                        <SelectContent>
                          {diplomeOptions.map((diplome) => (
                            <SelectItem key={diplome} value={diplome}>
                              {diplome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ErrorMessage name="diplome" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categorie">Catégorie *</Label>
                      <Select value={values.categorie} onValueChange={(value) => setFieldValue("categorie", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorieOptions.map((categorie) => (
                            <SelectItem key={categorie} value={categorie}>
                              {categorie}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ErrorMessage name="categorie" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departement">Département *</Label>
                    <Select value={values.departement} onValueChange={(value) => setFieldValue("departement", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le département" />
                      </SelectTrigger>
                      <SelectContent>
                        {departementOptions.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ErrorMessage name="departement" component="div" className="text-red-500 text-sm" />
                  </div>

                  {/* Congés et autorisations */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="congesRestants">Congés restants (jours) *</Label>
                      <Field as={Input} id="congesRestants" name="congesRestants" type="number" min="0" max="365" />
                      <ErrorMessage name="congesRestants" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="absence">Absences (jours) *</Label>
                      <Field as={Input} id="absence" name="absence" type="number" min="0" max="365" />
                      <ErrorMessage name="absence" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="autorisationRestante">Autorisations restantes *</Label>
                      <Field
                        as={Input}
                        id="autorisationRestante"
                        name="autorisationRestante"
                        type="number"
                        min="0"
                        max="100"
                      />
                      <ErrorMessage name="autorisationRestante" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="autorisationEcoulee">Autorisations écoulées *</Label>
                      <Field
                        as={Input}
                        id="autorisationEcoulee"
                        name="autorisationEcoulee"
                        type="number"
                        min="0"
                        max="100"
                      />
                      <ErrorMessage name="autorisationEcoulee" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  {/* Informations de suivi */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Informations de suivi</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Date de création :</span>{" "}
                        {new Date(employee.createdAt || employee.dateCreation || Date.now()).toLocaleDateString("fr-FR")}
                      </div>
                      <div>
                        <span className="font-medium">Dernière modification :</span>{" "}
                        {new Date(employee.updatedAt || employee.dateModification || Date.now()).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex gap-4 pt-6">
                    <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                    </Button>

                    <Link href="/admin/employees">
                      <Button type="button" variant="outline">
                        Annuler
                      </Button>
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
