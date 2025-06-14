const Employee = require("../models/Employee")
const { validationResult } = require("express-validator")

/**
 * @desc    Obtenir tous les employés
 * @route   GET /api/employees
 * @access  Private
 */
const getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, field, sortBy = "createdAt", sortOrder = "desc" } = req.query

    let query = {}

    // Recherche
    if (search) {
      if (field && field !== "all") {
        const searchRegex = new RegExp(search, "i")
        query[field] = searchRegex
      } else {
        const searchRegex = new RegExp(search, "i")
        query = {
          $or: [
            { nom: searchRegex },
            { prenom: searchRegex },
            { matricule: searchRegex },
            { telephone: searchRegex },
            { diplome: searchRegex },
            { categorie: searchRegex },
            { departement: searchRegex },
            { mois: searchRegex },
          ],
        }
      }
    }

    // Options de tri
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    // Pagination
    const options = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      sort: sortOptions,
    }

    const employees = await Employee.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Employee.countDocuments(query)

    res.json({
      success: true,
      data: employees,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des employés",
    })
  }
}

/**
 * @desc    Obtenir un employé par ID
 * @route   GET /api/employees/:id
 * @access  Private
 */
const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employé non trouvé",
      })
    }

    res.json({
      success: true,
      data: employee,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'employé:", error)

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "ID d'employé invalide",
      })
    }

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération de l'employé",
    })
  }
}

/**
 * @desc    Créer un nouvel employé
 * @route   POST /api/employees
 * @access  Private
 */
const createEmployee = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array(),
      })
    }

    // Vérifier si le matricule existe déjà
    const existingEmployee = await Employee.findOne({ matricule: req.body.matricule })
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Ce matricule existe déjà",
      })
    }

    const employee = await Employee.create(req.body)

    res.status(201).json({
      success: true,
      data: employee,
      message: "Employé créé avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la création de l'employé:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }))

      return res.status(400).json({
        success: false,
        message: "Erreur de validation",
        errors,
      })
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Ce matricule existe déjà",
      })
    }

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création de l'employé",
    })
  }
}

/**
 * @desc    Mettre à jour un employé
 * @route   PUT /api/employees/:id
 * @access  Private
 */
const updateEmployee = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array(),
      })
    }

    // Vérifier si le matricule existe déjà (sauf pour l'employé actuel)
    if (req.body.matricule) {
      const existingEmployee = await Employee.findOne({
        matricule: req.body.matricule,
        _id: { $ne: req.params.id },
      })

      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Ce matricule existe déjà",
        })
      }
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employé non trouvé",
      })
    }

    res.json({
      success: true,
      data: employee,
      message: "Employé mis à jour avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'employé:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }))

      return res.status(400).json({
        success: false,
        message: "Erreur de validation",
        errors,
      })
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "ID d'employé invalide",
      })
    }

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour de l'employé",
    })
  }
}

/**
 * @desc    Supprimer un employé
 * @route   DELETE /api/employees/:id
 * @access  Private
 */
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employé non trouvé",
      })
    }

    await Employee.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Employé supprimé avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'employé:", error)

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "ID d'employé invalide",
      })
    }

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression de l'employé",
    })
  }
}

/**
 * @desc    Obtenir les statistiques des employés
 * @route   GET /api/employees/stats
 * @access  Private
 */
const getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments()

    // Statistiques par département
    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: "$departement",
          count: { $sum: 1 },
          avgConges: { $avg: "$congesRestants" },
          avgAbsences: { $avg: "$absence" },
        },
      },
      {
        $project: {
          departement: "$_id",
          count: 1,
          avgConges: { $round: ["$avgConges", 1] },
          avgAbsences: { $round: ["$avgAbsences", 1] },
          percentage: {
            $round: [{ $multiply: [{ $divide: ["$count", totalEmployees] }, 100] }, 1],
          },
        },
      },
      { $sort: { count: -1 } },
    ])

    // Statistiques par catégorie
    const categoryStats = await Employee.aggregate([
      {
        $group: {
          _id: "$categorie",
          count: { $sum: 1 },
          avgConges: { $avg: "$congesRestants" },
          avgAbsences: { $avg: "$absence" },
        },
      },
      {
        $project: {
          categorie: "$_id",
          count: 1,
          avgConges: { $round: ["$avgConges", 1] },
          avgAbsences: { $round: ["$avgAbsences", 1] },
        },
      },
      { $sort: { count: -1 } },
    ])

    // Moyennes générales
    const generalStats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          avgConges: { $avg: "$congesRestants" },
          avgAbsences: { $avg: "$absence" },
          totalConges: { $sum: "$congesRestants" },
          totalAbsences: { $sum: "$absence" },
        },
      },
    ])

    // Alertes
    const lowLeaveCount = await Employee.countDocuments({ congesRestants: { $lt: 10 } })
    const highAbsenceCount = await Employee.countDocuments({ absence: { $gt: 10 } })

    res.json({
      success: true,
      data: {
        totalEmployees,
        generalStats: generalStats[0] || {
          avgConges: 0,
          avgAbsences: 0,
          totalConges: 0,
          totalAbsences: 0,
        },
        departmentStats,
        categoryStats,
        alerts: {
          lowLeaveCount,
          highAbsenceCount,
          total: lowLeaveCount + highAbsenceCount,
        },
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des statistiques",
    })
  }
}

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
}
