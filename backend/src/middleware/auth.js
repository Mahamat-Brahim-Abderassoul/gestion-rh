const jwt = require("jsonwebtoken")
const User = require("../models/User")

/**
 * Middleware pour protéger les routes
 * Vérifie si l'utilisateur est authentifié via JWT
 */
const protect = async (req, res, next) => {
  try {
    let token

    // Vérifier si le token est présent dans les headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Accès refusé. Token manquant.",
      })
    }

    try {
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Récupérer l'utilisateur
      const user = await User.findById(decoded.id)

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token invalide. Utilisateur non trouvé.",
        })
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Compte désactivé.",
        })
      }

      req.user = user
      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token invalide ou expiré.",
      })
    }
  } catch (error) {
    console.error("Erreur dans le middleware d'authentification:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur dans l'authentification",
    })
  }
}

/**
 * Middleware pour vérifier le rôle admin
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({
      success: false,
      message: "Accès refusé. Droits administrateur requis.",
    })
  }
}

module.exports = { protect, adminOnly }
