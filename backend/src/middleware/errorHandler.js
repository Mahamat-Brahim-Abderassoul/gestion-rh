/**
 * Middleware de gestion des erreurs
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  console.error("Erreur:", err)

  // Erreur de validation Mongoose
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")
    error = {
      success: false,
      message: "Erreur de validation",
      details: message,
    }
    return res.status(400).json(error)
  }

  // Erreur de duplication (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    const message = `${field} existe déjà`
    error = {
      success: false,
      message,
    }
    return res.status(400).json(error)
  }

  // Erreur de cast (ID invalide)
  if (err.name === "CastError") {
    const message = "Ressource non trouvée"
    error = {
      success: false,
      message,
    }
    return res.status(404).json(error)
  }

  // Erreur JWT
  if (err.name === "JsonWebTokenError") {
    const message = "Token invalide"
    error = {
      success: false,
      message,
    }
    return res.status(401).json(error)
  }

  // Erreur JWT expirée
  if (err.name === "TokenExpiredError") {
    const message = "Token expiré"
    error = {
      success: false,
      message,
    }
    return res.status(401).json(error)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Erreur serveur",
  })
}

module.exports = errorHandler
