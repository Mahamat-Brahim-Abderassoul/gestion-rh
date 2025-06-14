const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const dotenv = require("dotenv")

// Charger les variables d'environnement
dotenv.config()

// Importer les modules
const connectDB = require("./config/database")
const errorHandler = require("./middleware/errorHandler")

// Importer les routes
const authRoutes = require("./routes/auth")
const employeeRoutes = require("./routes/employees")

// Connecter à la base de données
connectDB()

const app = express()

// Middlewares de sécurité
app.use(helmet())

// Configuration CORS améliorée
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 heures en secondes
}

app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite chaque IP à 100 requêtes par windowMs
  message: {
    success: false,
    message: "Trop de requêtes, veuillez réessayer plus tard.",
  },
})
app.use(limiter)

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Body parser
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/employees", employeeRoutes)

// Route de test
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
  })
})

// Middleware de gestion des erreurs
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`)
})

// Gestion des erreurs non capturées
process.on("unhandledRejection", (err, promise) => {
  console.log(`Erreur non gérée: ${err.message}`)
  server.close(() => {
    process.exit(1)
  })
})

process.on("uncaughtException", (err) => {
  console.log(`Exception non capturée: ${err.message}`)
  process.exit(1)
})

module.exports = app
