const mongoose = require("mongoose")
const dotenv = require("dotenv")
const Employee = require("../models/Employee")
const User = require("../models/User")

// Charger les variables d'environnement
dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("✅ MongoDB connecté")
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB:", error)
    process.exit(1)
  }
}

const seedData = async () => {
  try {
    // Supprimer les données existantes
    await Employee.deleteMany()
    await User.deleteMany()

    console.log("🗑️  Données existantes supprimées")

    // Créer un utilisateur admin
    const admin = await User.create({
      nom: "Administrateur",
      prenom: "Système",
      email: "admin@gestionrh.com",
      password: "Admin123", // Sera hashé automatiquement
      role: "admin",
    })

    console.log("👤 Utilisateur admin créé")

    // Données d'exemple pour les employés avec les nouvelles catégories et départements
    const employeesData = [
      {
        mois: "Janvier",
        nom: "Dubois",
        prenom: "Marie",
        telephone: "+33 1 23 45 67 89",
        matricule: "EMP001",
        diplome: "Master",
        categorie: "Chef de département",
        departement: "Communication",
        congesRestants: 25,
        autorisationRestante: 8,
        autorisationEcoulee: 2,
        absence: 3,
      },
      {
        mois: "Février",
        nom: "Martin",
        prenom: "Jean",
        telephone: "+33 1 34 56 78 90",
        matricule: "EMP002",
        diplome: "BTS",
        categorie: "Agent",
        departement: "Finance",
        congesRestants: 18,
        autorisationRestante: 5,
        autorisationEcoulee: 5,
        absence: 7,
      },
      {
        mois: "Mars",
        nom: "Laurent",
        prenom: "Sophie",
        telephone: "+33 1 45 67 89 01",
        matricule: "EMP003",
        diplome: "Licence",
        categorie: "Directrice",
        departement: "GRH",
        congesRestants: 22,
        autorisationRestante: 10,
        autorisationEcoulee: 0,
        absence: 1,
      },
      {
        mois: "Avril",
        nom: "Bernard",
        prenom: "Pierre",
        telephone: "+33 1 56 78 90 12",
        matricule: "EMP004",
        diplome: "Ingénieur",
        categorie: "Directeur",
        departement: "Général",
        congesRestants: 30,
        autorisationRestante: 12,
        autorisationEcoulee: 3,
        absence: 0,
      },
      {
        mois: "Mai",
        nom: "Moreau",
        prenom: "Julie",
        telephone: "+33 1 67 89 01 23",
        matricule: "EMP005",
        diplome: "DUT",
        categorie: "Agent",
        departement: "Juridique",
        congesRestants: 15,
        autorisationRestante: 3,
        autorisationEcoulee: 7,
        absence: 12,
      },
      {
        mois: "Juin",
        nom: "Petit",
        prenom: "Antoine",
        telephone: "+33 1 78 90 12 34",
        matricule: "EMP006",
        diplome: "Master",
        categorie: "Directeur Adjoint",
        departement: "Planification",
        congesRestants: 28,
        autorisationRestante: 9,
        autorisationEcoulee: 1,
        absence: 2,
      },
      {
        mois: "Juillet",
        nom: "Roux",
        prenom: "Camille",
        telephone: "+33 1 89 01 23 45",
        matricule: "EMP007",
        diplome: "Baccalauréat",
        categorie: "Agent",
        departement: "Communication",
        congesRestants: 10,
        autorisationRestante: 2,
        autorisationEcoulee: 8,
        absence: 5,
      },
      {
        mois: "Août",
        nom: "Fournier",
        prenom: "Lucas",
        telephone: "+33 1 90 12 34 56",
        matricule: "EMP008",
        diplome: "Licence",
        categorie: "Agent",
        departement: "Finance",
        congesRestants: 20,
        autorisationRestante: 6,
        autorisationEcoulee: 4,
        absence: 8,
      },
    ]

    // Créer les employés
    const employees = await Employee.create(employeesData)

    console.log(`👥 ${employees.length} employés créés`)
    console.log("🎉 Données de test créées avec succès !")

    console.log("\n📋 Informations de connexion:")
    console.log("Email: admin@gestionrh.com")
    console.log("Mot de passe: Admin123")
    console.log(`Nom complet: ${admin.nomComplet}`)
  } catch (error) {
    console.error("❌ Erreur lors de la création des données:", error)
  }
}

const runSeed = async () => {
  await connectDB()
  await seedData()
  process.exit()
}

runSeed()
