# 🏢 GestionRH - Système de Gestion des Ressources Humaines

Une application web complète pour la gestion des employés, développée avec Next.js et Node.js.

## 🚀 Fonctionnalités

- ✅ **Gestion des employés** : Ajouter, modifier, supprimer et consulter les employés
- 📊 **Tableau de bord** : Vue d'ensemble avec statistiques
- 🔍 **Recherche avancée** : Recherche par nom, matricule, département, etc.
- 📈 **Statistiques** : Analyses détaillées par département et catégorie
- 📋 **Export Excel** : Export des données en format XLSX
- 🔐 **Authentification** : Système de connexion sécurisé pour les administrateurs
- 📱 **Responsive** : Interface adaptée à tous les écrans

## 🛠️ Technologies utilisées

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (composants UI)
- **Formik + Yup** (gestion des formulaires)
- **Lucide React** (icônes)

### Backend
- **Node.js**
- **Express.js**
- **MongoDB** avec Mongoose
- **JWT** (authentification)
- **bcryptjs** (hashage des mots de passe)
- **Express Validator** (validation des données)

## 📦 Installation locale

### Prérequis
- Node.js 18+ 
- MongoDB (local ou Atlas)
- Git

### 1. Cloner le repository
\`\`\`bash
git clone https://github.com/VOTRE_USERNAME/gestion-rh.git
cd gestion-rh
\`\`\`

### 2. Installation du frontend
\`\`\`bash
npm install
\`\`\`

### 3. Installation du backend
\`\`\`bash
cd backend
npm install
\`\`\`

### 4. Configuration des variables d'environnement

**Frontend** - Créer `.env.local` :
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

**Backend** - Modifier `backend/.env` :
\`\`\`env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gestion-rh
JWT_SECRET=votre_jwt_secret_tres_securise_ici
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
\`\`\`

### 5. Initialiser la base de données
\`\`\`bash
cd backend
npm run seed
\`\`\`

### 6. Démarrer l'application

**Terminal 1 - Backend** :
\`\`\`bash
cd backend
npm run dev
\`\`\`

**Terminal 2 - Frontend** :
\`\`\`bash
npm run dev
\`\`\`

L'application sera accessible sur : http://localhost:3000

## 🔑 Connexion par défaut

- **Email** : admin@gestionrh.com
- **Mot de passe** : Admin123

## 📁 Structure du projet

\`\`\`
gestion-rh/
├── app/                    # Pages Next.js (App Router)
│   ├── admin/             # Pages d'administration
│   ├── globals.css        # Styles globaux
│   └── layout.tsx         # Layout principal
├── backend/               # API Node.js
│   ├── src/
│   │   ├── controllers/   # Contrôleurs
│   │   ├── models/        # Modèles MongoDB
│   │   ├── routes/        # Routes API
│   │   ├── middleware/    # Middlewares
│   │   └── utils/         # Utilitaires
│   └── package.json
├── components/            # Composants React
├── contexts/             # Contextes React
├── hooks/                # Hooks personnalisés
├── lib/                  # Utilitaires et services
├── types/                # Types TypeScript
└── README.md
\`\`\`

## 🚀 Déploiement

### Option 1 : Vercel + Railway (Recommandé)

1. **Backend sur Railway** :
   - Créer un compte sur [railway.app](https://railway.app)
   - Connecter votre repository GitHub
   - Ajouter une base de données MongoDB
   - Configurer les variables d'environnement

2. **Frontend sur Vercel** :
   - Créer un compte sur [vercel.com](https://vercel.com)
   - Importer le projet depuis GitHub
   - Configurer \`NEXT_PUBLIC_API_URL\`

### Option 2 : Netlify + Heroku

Voir la documentation de déploiement complète dans \`DEPLOYMENT.md\`

## 📊 Données de test

Le script \`npm run seed\` crée :
- 1 administrateur
- 8 employés d'exemple
- Données réparties sur les nouveaux départements et catégories

## 🔧 Scripts disponibles

### Frontend
- \`npm run dev\` - Démarrer en développement
- \`npm run build\` - Build de production
- \`npm run start\` - Démarrer en production
- \`npm run lint\` - Vérifier le code

### Backend
- \`npm run dev\` - Démarrer avec nodemon
- \`npm start\` - Démarrer en production
- \`npm run seed\` - Initialiser les données de test

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit les changements (\`git commit -m 'Add some AmazingFeature'\`)
4. Push vers la branche (\`git push origin feature/AmazingFeature\`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier \`LICENSE\` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter : votre-email@example.com

## 🎯 Roadmap

- [ ] Gestion des congés avec calendrier
- [ ] Notifications en temps réel
- [ ] Rapports PDF
- [ ] API mobile
- [ ] Intégration avec systèmes de paie
- [ ] Multi-tenant (plusieurs entreprises)

---

Développé avec ❤️ pour la gestion moderne des ressources humaines.
