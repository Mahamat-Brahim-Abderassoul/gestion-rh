"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, UserPlus, Save } from "lucide-react"
import { employeeValidationSchema } from "@/lib/validation"
import { useEmployees } from "@/hooks/use-employees"
import type { EmployeeFormData } from "@/types/employee"

const initialValues: EmployeeFormData = {
  mois: "",
  nom: "",
  prenom: "",
  telephone: "",
  matricule: "",
  diplome: "",
  categorie: "",
  departement: "",
  congesRestants: 25,
  autorisationRestante: 10,
  autorisationEcoulee: 0,
  absence: 0,
}

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

export default function AddEmployeePage() {
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const router = useRouter()
  const { createEmployee } = useEmployees()

  const handleSubmit = async (values: EmployeeFormData, { setSubmitting }: any) => {
    try {
      await createEmployee(values)

      setSubmitStatus({
        type: "success",
        message: `Employé ${values.prenom} ${values.nom} ajouté avec succès !`,
      })

      // Rediriger vers la liste après 2 secondes
      setTimeout(() => {
        router.push("/admin/employees")
      }, 2000)
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message: error.message || "Erreur lors de l'ajout de l'employé. Veuillez réessayer.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Ajouter un Employé</h1>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Informations de l'employé
            </CardTitle>
            <CardDescription>Remplissez tous les champs requis pour ajouter un nouvel employé</CardDescription>
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
                      <Select onValueChange={(value) => setFieldValue("mois", value)}>
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
                      <Select onValueChange={(value) => setFieldValue("diplome", value)}>
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
                      <Select onValueChange={(value) => setFieldValue("categorie", value)}>
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
                    <Select onValueChange={(value) => setFieldValue("departement", value)}>
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

                  {/* Boutons d'action */}
                  <div className="flex gap-4 pt-6">
                    <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {isSubmitting ? "Enregistrement..." : "Enregistrer"}
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
