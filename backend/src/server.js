const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const dotenv = require("dotenv")

// Charger les variables d'environnement en premier
dotenv.config()

// Importer les modules après le chargement des variables d'environnement
const connectDB = require("./config/database")
const errorHandler = require("./middleware/errorHandler")

// Importer les routes
const authRoutes = require("./routes/auth")
const employeeRoutes = require("./routes/employees")

// Connecter à la base de données
connectDB()

const app = express()

// Trust proxy pour les déploiements (Railway, Heroku, etc.)
app.set("trust proxy", 1)

// Middlewares de sécurité
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
)

// Configuration CORS améliorée
const corsOptions = {
  origin: (origin, callback) => {
    // Permettre les requêtes sans origine (mobile apps, etc.)
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      "http://localhost:3000",
      "http://localhost:3001",
      "https://localhost:3000",
      // Ajouter d'autres domaines si nécessaire
    ].filter(Boolean)

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.log(`CORS: Origine non autorisée: ${origin}`)
      callback(new Error("Non autorisé par CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))

// Rate limiting avec configuration pour la production
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Trop de requêtes, veuillez réessayer plus tard.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting pour les health checks
  skip: (req) => {
    return req.path === "/api/health" || req.path === "/health"
  },
})

app.use(limiter)

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
} else {
  app.use(morgan("combined"))
}

// Body parser avec limites
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Health check route (avant les autres routes)
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API GestionRH fonctionne correctement",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
  })
})

// Routes API
app.use("/api/auth", authRoutes)
app.use("/api/employees", employeeRoutes)

// Route de test API
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API GestionRH fonctionne correctement",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// Route 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
    path: req.originalUrl,
  })
})

// Middleware de gestion des erreurs
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`)
  console.log(`📍 URL: http://0.0.0.0:${PORT}`)
  console.log(`🌍 CORS autorisé pour: ${process.env.CORS_ORIGIN}`)
})

// Gestion des erreurs non capturées
process.on("unhandledRejection", (err, promise) => {
  console.log(`❌ Erreur non gérée: ${err.message}`)
  console.log("🔄 Fermeture du serveur...")
  server.close(() => {
    process.exit(1)
  })
})

process.on("uncaughtException", (err) => {
  console.log(`❌ Exception non capturée: ${err.message}`)
  console.log("🔄 Fermeture du serveur...")
  process.exit(1)
})

// Gestion propre de l'arrêt
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM reçu, fermeture propre du serveur...")
  server.close(() => {
    console.log("✅ Serveur fermé proprement")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  console.log("🛑 SIGINT reçu, fermeture propre du serveur...")
  server.close(() => {
    console.log("✅ Serveur fermé proprement")
    process.exit(0)
  })
})

module.exports = app
