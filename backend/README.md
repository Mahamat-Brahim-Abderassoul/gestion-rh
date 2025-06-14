# API Backend - Système de Gestion RH

## Installation

1. **Installer les dépendances**
\`\`\`bash
cd backend
npm install
\`\`\`

2. **Configuration de l'environnement**
\`\`\`bash
# Vérifiez que le fichier .env est correctement configuré
# Modifiez les variables selon votre configuration
\`\`\`

3. **Base de données MongoDB**
\`\`\`bash
# Option 1: MongoDB local
# Assurez-vous que MongoDB est installé et en cours d'exécution

# Option 2: MongoDB Atlas (cloud)
# Créez un cluster sur https://cloud.mongodb.com
# Remplacez MONGODB_URI dans .env par votre chaîne de connexion Atlas
\`\`\`

4. **Initialiser les données de test**
\`\`\`bash
npm run seed
\`\`\`

5. **Démarrer le serveur**
\`\`\`bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
\`\`\`

## API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription (admin)
- `GET /api/auth/profile` - Profil utilisateur

### Employés
- `GET /api/employees` - Liste des employés (avec pagination et recherche)
- `GET /api/employees/:id` - Détails d'un employé
- `POST /api/employees` - Créer un employé
- `PUT /api/employees/:id` - Modifier un employé
- `DELETE /api/employees/:id` - Supprimer un employé
- `GET /api/employees/stats` - Statistiques

### Santé de l'API
- `GET /api/health` - Vérifier le statut de l'API

## Authentification

Toutes les routes employés nécessitent un token JWT dans le header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Variables d'environnement

\`\`\`env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gestion-rh
JWT_SECRET=votre_jwt_secret_tres_securise_ici
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
\`\`\`

## Scripts disponibles

- `npm start` - Démarrer en production
- `npm run dev` - Démarrer en développement
- `npm run seed` - Initialiser les données de test
- `npm test` - Lancer les tests

## Structure du projet

\`\`\`
backend/
├── src/
│   ├── config/          # Configuration (DB, etc.)
│   ├── controllers/     # Contrôleurs
│   ├── middleware/      # Middlewares
│   ├── models/          # Modèles MongoDB
│   ├── routes/          # Routes API
│   ├── utils/           # Utilitaires
│   ├── validators/      # Validation des données
│   └── server.js        # Point d'entrée
├── .env                 # Variables d'environnement
├── package.json
└── README.md
