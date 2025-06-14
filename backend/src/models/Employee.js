const mongoose = require("mongoose")

/**
 * Schéma pour les employés
 */
const employeeSchema = new mongoose.Schema(
  {
    mois: {
      type: String,
      required: [true, "Le mois est requis"],
      enum: {
        values: [
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
        ],
        message: "Mois invalide",
      },
    },
    nom: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
      minlength: [2, "Le nom doit contenir au moins 2 caractères"],
      maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"],
    },
    prenom: {
      type: String,
      required: [true, "Le prénom est requis"],
      trim: true,
      minlength: [2, "Le prénom doit contenir au moins 2 caractères"],
      maxlength: [50, "Le prénom ne peut pas dépasser 50 caractères"],
    },
    telephone: {
      type: String,
      required: [true, "Le numéro de téléphone est requis"],
      trim: true,
      validate: {
        validator: (v) => /^[0-9+\-\s()]+$/.test(v),
        message: "Format de téléphone invalide",
      },
    },
    matricule: {
      type: String,
      required: [true, "Le matricule est requis"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "Le matricule doit contenir au moins 3 caractères"],
      maxlength: [20, "Le matricule ne peut pas dépasser 20 caractères"],
    },
    diplome: {
      type: String,
      required: [true, "Le diplôme est requis"],
      enum: {
        values: ["Baccalauréat", "BTS", "DUT", "Licence", "Master", "Doctorat", "Ingénieur", "Autre"],
        message: "Diplôme invalide",
      },
    },
    categorie: {
      type: String,
      required: [true, "La catégorie est requise"],
      enum: {
        values: ["Chef de département", "Agent", "Directeur", "Directeur Adjoint", "Directrice"],
        message: "Catégorie invalide",
      },
    },
    departement: {
      type: String,
      required: [true, "Le département est requis"],
      enum: {
        values: ["Communication", "Finance", "Général", "GRH", "Juridique", "Planification"],
        message: "Département invalide",
      },
    },
    congesRestants: {
      type: Number,
      required: [true, "Les congés restants sont requis"],
      min: [0, "Les congés restants ne peuvent pas être négatifs"],
      max: [365, "Les congés restants ne peuvent pas dépasser 365 jours"],
    },
    autorisationRestante: {
      type: Number,
      required: [true, "Les autorisations restantes sont requises"],
      min: [0, "Les autorisations restantes ne peuvent pas être négatives"],
      max: [100, "Les autorisations restantes ne peuvent pas dépasser 100"],
    },
    autorisationEcoulee: {
      type: Number,
      required: [true, "Les autorisations écoulées sont requises"],
      min: [0, "Les autorisations écoulées ne peuvent pas être négatives"],
      max: [100, "Les autorisations écoulées ne peuvent pas dépasser 100"],
    },
    absence: {
      type: Number,
      required: [true, "Les absences sont requises"],
      min: [0, "Les absences ne peuvent pas être négatives"],
      max: [365, "Les absences ne peuvent pas dépasser 365 jours"],
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Index pour améliorer les performances de recherche
employeeSchema.index({ matricule: 1 }, { unique: true })
employeeSchema.index({ nom: 1, prenom: 1 })
employeeSchema.index({ departement: 1 })
employeeSchema.index({ categorie: 1 })
employeeSchema.index({ createdAt: -1 })

// Propriété virtuelle pour le nom complet
employeeSchema.virtual("nomComplet").get(function () {
  return `${this.prenom} ${this.nom}`
})

// Méthode statique pour la recherche
employeeSchema.statics.search = function (query, field = null) {
  const searchRegex = new RegExp(query, "i")

  if (field && this.schema.paths[field]) {
    return this.find({ [field]: searchRegex })
  }

  // Recherche dans plusieurs champs
  return this.find({
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
  })
}

// Middleware pre-save pour formater les données
employeeSchema.pre("save", function (next) {
  // Capitaliser le nom et prénom
  if (this.nom) {
    this.nom = this.nom.charAt(0).toUpperCase() + this.nom.slice(1).toLowerCase()
  }
  if (this.prenom) {
    this.prenom = this.prenom.charAt(0).toUpperCase() + this.prenom.slice(1).toLowerCase()
  }
  next()
})

module.exports = mongoose.model("Employee", employeeSchema)
