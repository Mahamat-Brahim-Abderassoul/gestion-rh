const mongoose = require("mongoose")

/**
 * Fonction pour connecter à MongoDB avec gestion d'erreurs améliorée
 */
const connectDB = async () => {
  try {
    // Vérifier que l'URI MongoDB est définie
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI n'est pas définie dans les variables d'environnement")
    }

    // Options de connexion recommandées pour la production
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintenir jusqu'à 10 connexions socket
      serverSelectionTimeoutMS: 5000, // Garder en essayant de se connecter pendant 5 secondes
      socketTimeoutMS: 45000, // Fermer les sockets après 45 secondes d'inactivité
      family: 4, // Utiliser IPv4, ignorer IPv6
      retryWrites: true,
      w: "majority",
    }

    // Connexion à MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options)

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

    // Gestion de la reconnexion
    mongoose.connection.on("reconnected", () => {
      console.log("🔄 Mongoose reconnecté à MongoDB")
    })

    // Fermeture propre de la connexion
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close()
        console.log("🔒 Connexion MongoDB fermée suite à l'arrêt de l'application")
        process.exit(0)
      } catch (error) {
        console.error("❌ Erreur lors de la fermeture de la connexion MongoDB:", error)
        process.exit(1)
      }
    })
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB:", error.message)

    // Afficher des conseils selon le type d'erreur
    if (error.message.includes("ECONNREFUSED")) {
      console.log("💡 Conseil: Vérifiez que MongoDB est accessible")
      console.log("   - Pour MongoDB Atlas: vérifiez l'URI et les accès réseau")
      console.log("   - Pour MongoDB local: vérifiez que le service est démarré")
    }

    if (error.message.includes("authentication failed")) {
      console.log("💡 Conseil: Vérifiez vos identifiants MongoDB")
      console.log("   - Username et password corrects")
      console.log("   - Utilisateur a les bonnes permissions")
    }

    if (error.message.includes("MONGODB_URI")) {
      console.log("💡 Conseil: Configurez la variable d'environnement MONGODB_URI")
      console.log("   - Format Atlas: mongodb+srv://user:pass@cluster.mongodb.net/dbname")
      console.log("   - Format local: mongodb://localhost:27017/dbname")
    }

    // En production, on peut essayer de reconnecter
    if (process.env.NODE_ENV === "production") {
      console.log("🔄 Tentative de reconnexion dans 5 secondes...")
      setTimeout(() => {
        connectDB()
      }, 5000)
    } else {
      process.exit(1)
    }
  }
}

module.exports = connectDB
