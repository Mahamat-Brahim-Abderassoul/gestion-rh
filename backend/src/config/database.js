const mongoose = require("mongoose")

/**
 * Fonction pour connecter à MongoDB
 */
const connectDB = async () => {
  try {
    // Connexion à MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI)

    console.log(`✅ MongoDB connecté: ${conn.connection.host}`)
    console.log(`📊 Base de données: ${conn.connection.name}`)

    // Événements de connexion
    mongoose.connection.on("connected", () => {
      console.log("🔗 Mongoose connecté à MongoDB")
    })

    mongoose.connection.on("error", (err) => {
      console.error("❌ Erreur de connexion Mongoose:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("🔌 Mongoose déconnecté de MongoDB")
    })

    // Fermeture propre de la connexion
    process.on("SIGINT", async () => {
      await mongoose.connection.close()
      console.log("🔒 Connexion MongoDB fermée suite à l'arrêt de l'application")
      process.exit(0)
    })
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB:", error.message)

    // Afficher des conseils selon le type d'erreur
    if (error.message.includes("ECONNREFUSED")) {
      console.log("💡 Conseil: Vérifiez que MongoDB est démarré")
      console.log("   - MongoDB local: brew services start mongodb-community")
      console.log("   - Ou utilisez MongoDB Atlas (cloud)")
    }

    if (error.message.includes("authentication failed")) {
      console.log("💡 Conseil: Vérifiez vos identifiants MongoDB")
    }

    process.exit(1)
  }
}

module.exports = connectDB
