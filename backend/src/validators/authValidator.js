const { body } = require("express-validator")

/**
 * Règles de validation pour la connexion
 */
const loginValidationRules = () => {
  return [
    body("email").isEmail().withMessage("Format d'email invalide").normalizeEmail(),

    body("password").notEmpty().withMessage("Le mot de passe est requis"),
  ]
}

/**
 * Règles de validation pour l'inscription
 */
const registerValidationRules = () => {
  return [
    body("nom")
      .trim()
      .notEmpty()
      .withMessage("Le nom est requis")
      .isLength({ min: 2, max: 50 })
      .withMessage("Le nom doit contenir entre 2 et 50 caractères"),

    body("prenom")
      .trim()
      .notEmpty()
      .withMessage("Le prénom est requis")
      .isLength({ min: 2, max: 50 })
      .withMessage("Le prénom doit contenir entre 2 et 50 caractères"),

    body("email").isEmail().withMessage("Format d'email invalide").normalizeEmail(),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Le mot de passe doit contenir au moins 6 caractères")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"),

    body("role").optional().isIn(["admin", "user"]).withMessage("Rôle invalide"),
  ]
}

/**
 * Règles de validation pour la mise à jour du profil
 */
const updateProfileValidationRules = () => {
  return [
    body("nom")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Le nom doit contenir entre 2 et 50 caractères"),

    body("prenom")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Le prénom doit contenir entre 2 et 50 caractères"),

    body("email").optional().isEmail().withMessage("Format d'email invalide").normalizeEmail(),

    body("currentPassword")
      .optional()
      .notEmpty()
      .withMessage("Le mot de passe actuel est requis pour changer le mot de passe"),

    body("newPassword")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Le nouveau mot de passe doit contenir au moins 6 caractères")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"),
  ]
}

module.exports = {
  loginValidationRules,
  registerValidationRules,
  updateProfileValidationRules,
}
