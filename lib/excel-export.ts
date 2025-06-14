import * as XLSX from "xlsx"
import type { Employee } from "@/types/employee"

/**
 * Exporter les données des employés vers un fichier Excel
 */
export const exportEmployeesToExcel = (employees: Employee[], filename = "employes") => {
  try {
    // Préparer les données pour l'exportation
    const exportData = employees.map((emp, index) => ({
      "N°": index + 1,
      Matricule: emp.matricule,
      Nom: emp.nom,
      Prénom: emp.prenom,
      "Nom Complet": `${emp.prenom} ${emp.nom}`,
      Téléphone: emp.telephone,
      Email: "", // Vous pouvez ajouter ce champ si disponible
      Mois: emp.mois,
      Diplôme: emp.diplome,
      Catégorie: emp.categorie,
      Département: emp.departement,
      "Congés Restants (jours)": emp.congesRestants,
      "Autorisations Restantes": emp.autorisationRestante,
      "Autorisations Écoulées": emp.autorisationEcoulee,
      "Total Autorisations": emp.autorisationRestante + emp.autorisationEcoulee,
      "Absences (jours)": emp.absence,
      "Date de Création": new Date(emp.dateCreation).toLocaleDateString("fr-FR"),
      "Date de Modification": new Date(emp.dateModification).toLocaleDateString("fr-FR"),
    }))

    // Créer un nouveau classeur
    const workbook = XLSX.utils.book_new()

    // Créer la feuille principale avec les données des employés
    const mainWorksheet = XLSX.utils.json_to_sheet(exportData)

    // Définir la largeur des colonnes
    const columnWidths = [
      { wch: 5 }, // N°
      { wch: 12 }, // Matricule
      { wch: 15 }, // Nom
      { wch: 15 }, // Prénom
      { wch: 25 }, // Nom Complet
      { wch: 18 }, // Téléphone
      { wch: 25 }, // Email
      { wch: 12 }, // Mois
      { wch: 15 }, // Diplôme
      { wch: 18 }, // Catégorie
      { wch: 20 }, // Département
      { wch: 18 }, // Congés Restants
      { wch: 18 }, // Autorisations Restantes
      { wch: 18 }, // Autorisations Écoulées
      { wch: 18 }, // Total Autorisations
      { wch: 15 }, // Absences
      { wch: 18 }, // Date de Création
      { wch: 18 }, // Date de Modification
    ]

    mainWorksheet["!cols"] = columnWidths

    // Ajouter la feuille au classeur
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, "Employés")

    // Créer une feuille de statistiques
    const stats = generateStatistics(employees)
    const statsWorksheet = XLSX.utils.json_to_sheet(stats)

    // Définir la largeur des colonnes pour les statistiques
    statsWorksheet["!cols"] = [
      { wch: 25 }, // Catégorie/Département
      { wch: 15 }, // Nombre
      { wch: 15 }, // Pourcentage
      { wch: 18 }, // Congés Moyens
      { wch: 18 }, // Absences Moyennes
    ]

    XLSX.utils.book_append_sheet(workbook, statsWorksheet, "Statistiques")

    // Créer une feuille de résumé
    const summaryData = [
      { Indicateur: "Total Employés", Valeur: employees.length },
      {
        Indicateur: "Congés Moyens",
        Valeur: `${(employees.reduce((sum, emp) => sum + emp.congesRestants, 0) / employees.length).toFixed(1)} jours`,
      },
      {
        Indicateur: "Absences Moyennes",
        Valeur: `${(employees.reduce((sum, emp) => sum + emp.absence, 0) / employees.length).toFixed(1)} jours`,
      },
      {
        Indicateur: "Total Congés Restants",
        Valeur: `${employees.reduce((sum, emp) => sum + emp.congesRestants, 0)} jours`,
      },
      { Indicateur: "Total Absences", Valeur: `${employees.reduce((sum, emp) => sum + emp.absence, 0)} jours` },
      { Indicateur: "Date d'Export", Valeur: new Date().toLocaleDateString("fr-FR") },
      { Indicateur: "Heure d'Export", Valeur: new Date().toLocaleTimeString("fr-FR") },
    ]

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
    summaryWorksheet["!cols"] = [{ wch: 25 }, { wch: 30 }]
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Résumé")

    // Générer le nom du fichier avec la date
    const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const finalFilename = `${filename}_${timestamp}.xlsx`

    // Écrire et télécharger le fichier
    XLSX.writeFile(workbook, finalFilename)

    return {
      success: true,
      filename: finalFilename,
      recordCount: employees.length,
    }
  } catch (error) {
    console.error("Erreur lors de l'exportation Excel:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    }
  }
}

/**
 * Générer des statistiques pour la feuille de statistiques
 */
const generateStatistics = (employees: Employee[]) => {
  const stats: any[] = []

  // Statistiques par département
  const departmentStats = employees.reduce(
    (acc, emp) => {
      if (!acc[emp.departement]) {
        acc[emp.departement] = {
          count: 0,
          totalConges: 0,
          totalAbsences: 0,
        }
      }
      acc[emp.departement].count++
      acc[emp.departement].totalConges += emp.congesRestants
      acc[emp.departement].totalAbsences += emp.absence
      return acc
    },
    {} as Record<string, { count: number; totalConges: number; totalAbsences: number }>,
  )

  // Ajouter un en-tête pour les départements
  stats.push({
    "Catégorie/Département": "=== STATISTIQUES PAR DÉPARTEMENT ===",
    Nombre: "",
    "Pourcentage (%)": "",
    "Congés Moyens": "",
    "Absences Moyennes": "",
  })

  Object.entries(departmentStats).forEach(([dept, data]) => {
    stats.push({
      "Catégorie/Département": dept,
      Nombre: data.count,
      "Pourcentage (%)": ((data.count / employees.length) * 100).toFixed(1),
      "Congés Moyens": (data.totalConges / data.count).toFixed(1),
      "Absences Moyennes": (data.totalAbsences / data.count).toFixed(1),
    })
  })

  // Ligne vide
  stats.push({
    "Catégorie/Département": "",
    Nombre: "",
    "Pourcentage (%)": "",
    "Congés Moyens": "",
    "Absences Moyennes": "",
  })

  // Statistiques par catégorie
  const categoryStats = employees.reduce(
    (acc, emp) => {
      if (!acc[emp.categorie]) {
        acc[emp.categorie] = {
          count: 0,
          totalConges: 0,
          totalAbsences: 0,
        }
      }
      acc[emp.categorie].count++
      acc[emp.categorie].totalConges += emp.congesRestants
      acc[emp.categorie].totalAbsences += emp.absence
      return acc
    },
    {} as Record<string, { count: number; totalConges: number; totalAbsences: number }>,
  )

  // Ajouter un en-tête pour les catégories
  stats.push({
    "Catégorie/Département": "=== STATISTIQUES PAR CATÉGORIE ===",
    Nombre: "",
    "Pourcentage (%)": "",
    "Congés Moyens": "",
    "Absences Moyennes": "",
  })

  Object.entries(categoryStats).forEach(([cat, data]) => {
    stats.push({
      "Catégorie/Département": cat,
      Nombre: data.count,
      "Pourcentage (%)": ((data.count / employees.length) * 100).toFixed(1),
      "Congés Moyens": (data.totalConges / data.count).toFixed(1),
      "Absences Moyennes": (data.totalAbsences / data.count).toFixed(1),
    })
  })

  return stats
}

/**
 * Exporter un employé spécifique vers Excel
 */
export const exportSingleEmployeeToExcel = (employee: Employee) => {
  try {
    const employeeData = [
      { Champ: "Matricule", Valeur: employee.matricule },
      { Champ: "Nom", Valeur: employee.nom },
      { Champ: "Prénom", Valeur: employee.prenom },
      { Champ: "Nom Complet", Valeur: `${employee.prenom} ${employee.nom}` },
      { Champ: "Téléphone", Valeur: employee.telephone },
      { Champ: "Mois", Valeur: employee.mois },
      { Champ: "Diplôme", Valeur: employee.diplome },
      { Champ: "Catégorie", Valeur: employee.categorie },
      { Champ: "Département", Valeur: employee.departement },
      { Champ: "Congés Restants", Valeur: `${employee.congesRestants} jours` },
      { Champ: "Autorisations Restantes", Valeur: employee.autorisationRestante },
      { Champ: "Autorisations Écoulées", Valeur: employee.autorisationEcoulee },
      { Champ: "Total Autorisations", Valeur: employee.autorisationRestante + employee.autorisationEcoulee },
      { Champ: "Absences", Valeur: `${employee.absence} jours` },
      { Champ: "Date de Création", Valeur: new Date(employee.dateCreation).toLocaleDateString("fr-FR") },
      { Champ: "Date de Modification", Valeur: new Date(employee.dateModification).toLocaleDateString("fr-FR") },
    ]

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(employeeData)

    worksheet["!cols"] = [{ wch: 25 }, { wch: 30 }]

    XLSX.utils.book_append_sheet(workbook, worksheet, "Employé")

    const filename = `employe_${employee.matricule}_${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(workbook, filename)

    return { success: true, filename }
  } catch (error) {
    console.error("Erreur lors de l'exportation de l'employé:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    }
  }
}
