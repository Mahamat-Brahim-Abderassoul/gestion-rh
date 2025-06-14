const User = require("../models/User")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")

/**
 * Générer un token JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

/**
 * @desc    Connexion utilisateur
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
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

    const { email, password } = req.body

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      })
    }

    // Vérifier si le compte est verrouillé
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: "Compte temporairement verrouillé. Réessayez plus tard.",
      })
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Compte désactivé",
      })
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      // Incrémenter les tentatives de connexion
      await user.incLoginAttempts()

      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      })
    }

    // Réinitialiser les tentatives de connexion en cas de succès
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts()
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date()
    await user.save()

    // Générer le token
    const token = generateToken(user._id)

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        nomComplet: user.nomComplet,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la connexion:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la connexion",
    })
  }
}

/**
 * @desc    Obtenir le profil utilisateur
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      })
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        nomComplet: user.nomComplet,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération du profil",
    })
  }
}

/**
 * @desc    Mettre à jour le profil utilisateur
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
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

    const { nom, prenom, email, currentPassword, newPassword } = req.body

    // Récupérer l'utilisateur actuel
    const user = await User.findById(req.user.id).select("+password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      })
    }

    // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Cet email est déjà utilisé",
        })
      }
    }

    // Si le mot de passe doit être changé, vérifier l'ancien mot de passe
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Le mot de passe actuel est requis pour changer le mot de passe",
        })
      }

      // Vérifier l'ancien mot de passe
      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Mot de passe actuel incorrect",
        })
      }

      // Mettre à jour le mot de passe
      user.password = newPassword
    }

    // Mettre à jour les autres champs
    if (nom) user.nom = nom
    if (prenom) user.prenom = prenom
    if (email) user.email = email

    await user.save()

    res.json({
      success: true,
      message: "Profil mis à jour avec succès",
      data: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        nomComplet: user.nomComplet,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour du profil",
    })
  }
}

/**
 * @desc    Inscription utilisateur (admin seulement)
 * @route   POST /api/auth/register
 * @access  Private (Admin)
 */
const register = async (req, res) => {
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

    const { nom, prenom, email, password, role = "admin" } = req.body

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Un utilisateur avec cet email existe déjà",
      })
    }

    // Créer l'utilisateur
    const user = await User.create({
      nom,
      prenom,
      email,
      password,
      role,
    })

    // Générer le token
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        nomComplet: user.nomComplet,
      },
    })
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Un utilisateur avec cet email existe déjà",
      })
    }

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'inscription",
    })
  }
}

module.exports = {
  login,
  getProfile,
  updateProfile,
  register,
}
