const { body } = require("express-validator")

/**
 * Règles de validation pour les employés
 */
const employeeValidationRules = () => {
  return [
    body("mois")
      .notEmpty()
      .withMessage("Le mois est requis")
      .isIn([
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
      ])
      .withMessage("Mois invalide"),

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

    body("telephone")
      .trim()
      .notEmpty()
      .withMessage("Le numéro de téléphone est requis")
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage("Format de téléphone invalide"),

    body("matricule")
      .trim()
      .notEmpty()
      .withMessage("Le matricule est requis")
      .isLength({ min: 3, max: 20 })
      .withMessage("Le matricule doit contenir entre 3 et 20 caractères"),

    body("diplome")
      .notEmpty()
      .withMessage("Le diplôme est requis")
      .isIn(["Baccalauréat", "BTS", "DUT", "Licence", "Master", "Doctorat", "Ingénieur", "Autre"])
      .withMessage("Diplôme invalide"),

    body("categorie")
      .notEmpty()
      .withMessage("La catégorie est requise")
      .isIn(["Chef de département", "Agent", "Directeur", "Directeur Adjoint", "Directrice"])
      .withMessage("Catégorie invalide"),

    body("departement")
      .notEmpty()
      .withMessage("Le département est requis")
      .isIn(["Communication", "Finance", "Général", "GRH", "Juridique", "Planification"])
      .withMessage("Département invalide"),

    body("congesRestants")
      .isInt({ min: 0, max: 365 })
      .withMessage("Les congés restants doivent être entre 0 et 365 jours"),

    body("autorisationRestante")
      .isInt({ min: 0, max: 100 })
      .withMessage("Les autorisations restantes doivent être entre 0 et 100"),

    body("autorisationEcoulee")
      .isInt({ min: 0, max: 100 })
      .withMessage("Les autorisations écoulées doivent être entre 0 et 100"),

    body("absence").isInt({ min: 0, max: 365 }).withMessage("Les absences doivent être entre 0 et 365 jours"),
  ]
}

module.exports = {
  employeeValidationRules,
}
