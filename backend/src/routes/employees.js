const express = require("express")
const router = express.Router()
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
} = require("../controllers/employeeController")
const { protect, adminOnly } = require("../middleware/auth")
const { employeeValidationRules } = require("../validators/employeeValidator")

// Toutes les routes nécessitent une authentification
router.use(protect)
router.use(adminOnly)

// Routes pour les statistiques (avant les routes avec :id)
router.get("/stats", getEmployeeStats)

// Routes CRUD
router.route("/").get(getEmployees).post(employeeValidationRules(), createEmployee)

router.route("/:id").get(getEmployee).put(employeeValidationRules(), updateEmployee).delete(deleteEmployee)

module.exports = router
