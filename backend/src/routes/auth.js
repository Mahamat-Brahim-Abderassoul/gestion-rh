const express = require("express")
const router = express.Router()
const { login, getProfile, register, updateProfile } = require("../controllers/authController")
const { protect } = require("../middleware/auth")
const {
  loginValidationRules,
  registerValidationRules,
  updateProfileValidationRules,
} = require("../validators/authValidator")

// Routes publiques
router.post("/login", loginValidationRules(), login)
router.post("/register", registerValidationRules(), register) // À sécuriser en production

// Routes protégées
router.get("/profile", protect, getProfile)
router.put("/profile", protect, updateProfileValidationRules(), updateProfile)

module.exports = router
