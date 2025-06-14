const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

/**
 * Schéma pour les utilisateurs (administrateurs)
 */
const userSchema = new mongoose.Schema(
  {
    // Informations personnelles
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
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v),
        message: "Format d'email invalide",
      },
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"],
      select: false, // Ne pas inclure le mot de passe par défaut dans les requêtes
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "user"],
        message: "Rôle invalide",
      },
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Index pour améliorer les performances
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ isActive: 1 })

// Propriété virtuelle pour le nom complet
userSchema.virtual("nomComplet").get(function () {
  return `${this.prenom} ${this.nom}`
})

// Propriété virtuelle pour vérifier si le compte est verrouillé
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Hash du mot de passe avant sauvegarde
userSchema.pre("save", async function (next) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified("password")) return next()

  try {
    // Générer le salt et hasher le mot de passe
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Middleware pre-save pour formater les données
userSchema.pre("save", function (next) {
  // Capitaliser le nom et prénom
  if (this.nom) {
    this.nom = this.nom.charAt(0).toUpperCase() + this.nom.slice(1).toLowerCase()
  }
  if (this.prenom) {
    this.prenom = this.prenom.charAt(0).toUpperCase() + this.prenom.slice(1).toLowerCase()
  }
  next()
})

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw new Error("Erreur lors de la comparaison du mot de passe")
  }
}

// Méthode pour incrémenter les tentatives de connexion
userSchema.methods.incLoginAttempts = function () {
  // Si nous avons une date de verrouillage précédente et qu'elle est expirée, redémarrer à 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    })
  }

  const updates = { $inc: { loginAttempts: 1 } }

  // Verrouiller le compte après 5 tentatives pour 2 heures
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } // 2 heures
  }

  return this.updateOne(updates)
}

// Méthode pour réinitialiser les tentatives de connexion
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  })
}

module.exports = mongoose.model("User", userSchema)
