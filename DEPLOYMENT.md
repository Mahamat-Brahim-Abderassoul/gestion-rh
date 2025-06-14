# 🚀 Guide de Déploiement - GestionRH

Ce guide vous accompagne étape par étape pour déployer votre application GestionRH en production.

## 📋 Prérequis

- Compte GitHub
- Compte Vercel (gratuit)
- Compte Railway (gratuit) ou MongoDB Atlas
- Node.js 18+ installé localement

## 🎯 Architecture de déploiement

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Base de       │
│   (Vercel)      │◄──►│   (Railway)     │◄──►│   données       │
│   Next.js       │    │   Node.js       │    │   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

## 🔧 Étape 1 : Préparer le repository GitHub

### 1.1 Créer le repository sur GitHub

1. Aller sur [github.com](https://github.com)
2. Cliquer sur "New repository"
3. Nom : `gestion-rh`
4. Description : "Système de Gestion des Ressources Humaines"
5. Cocher "Add a README file"
6. Cliquer "Create repository"

### 1.2 Cloner et pousser le code

\`\`\`bash
# Dans votre dossier de projet local
git init
git add .
git commit -m "Initial commit: GestionRH application"

# Ajouter l'origine GitHub (remplacer VOTRE_USERNAME)
git remote add origin https://github.com/VOTRE_USERNAME/gestion-rh.git

# Pousser le code
git branch -M main
git push -u origin main
\`\`\`

## 🗄️ Étape 2 : Configurer la base de données

### Option A : MongoDB Atlas (Recommandé)

1. **Créer un compte** sur [mongodb.com/atlas](https://www.mongodb.com/atlas)

2. **Créer un cluster** :
   - Choisir "Free Shared"
   - Région : Europe (Ireland) ou proche de vous
   - Nom du cluster : `gestion-rh-cluster`

3. **Configurer l'accès** :
   - Database Access → Add New Database User
   - Username : `admin`
   - Password : Générer un mot de passe fort
   - Role : `Atlas admin`

4. **Configurer le réseau** :
   - Network Access → Add IP Address
   - Choisir "Allow access from anywhere" (0.0.0.0/0)

5. **Obtenir l'URI de connexion** :
   - Clusters → Connect → Connect your application
   - Copier l'URI (format : `mongodb+srv://admin:password@cluster.mongodb.net/`)

### Option B : Railway avec MongoDB

1. Aller sur [railway.app](https://railway.app)
2. Créer un compte avec GitHub
3. New Project → Add MongoDB
4. Copier l'URI de connexion fournie

## 🚂 Étape 3 : Déployer le Backend sur Railway

### 3.1 Créer le projet Railway

1. **Nouveau projet** :
   - Aller sur [railway.app](https://railway.app)
   - "New Project" → "Deploy from GitHub repo"
   - Sélectionner votre repository `gestion-rh`

2. **Configurer le service** :
   - Railway détecte automatiquement le dossier `backend`
   - Si ce n'est pas le cas, aller dans Settings → Root Directory → `backend`

### 3.2 Configurer les variables d'environnement

Dans Railway, aller dans Variables et ajouter :

\`\`\`env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://admin:password@cluster.mongodb.net/gestion-rh
JWT_SECRET=super_secret_jwt_key_production_2024_change_me
JWT_EXPIRE=7d
CORS_ORIGIN=https://votre-app.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
\`\`\`

⚠️ **Important** :
- Remplacer `MONGODB_URI` par votre vraie URI
- Générer un `JWT_SECRET` fort (32+ caractères)
- `CORS_ORIGIN` sera mis à jour après le déploiement Vercel

### 3.3 Déployer

1. Railway déploie automatiquement
2. Attendre que le déploiement soit terminé (voyant vert)
3. Copier l'URL du service (ex: `https://backend-production-xxxx.up.railway.app`)

### 3.4 Initialiser les données

\`\`\`bash
# Localement, mettre à jour l'URL dans backend/.env
MONGODB_URI=votre_uri_mongodb_atlas

# Exécuter le seed
cd backend
npm run seed
\`\`\`

## 🌐 Étape 4 : Déployer le Frontend sur Vercel

### 4.1 Créer le projet Vercel

1. **Nouveau projet** :
   - Aller sur [vercel.com](https://vercel.com)
   - "New Project" → Import Git Repository
   - Sélectionner votre repository `gestion-rh`

2. **Configuration du build** :
   - Framework Preset : Next.js
   - Root Directory : `./` (racine)
   - Build Command : `npm run build`
   - Output Directory : `.next`

### 4.2 Configurer les variables d'environnement

Dans Vercel, aller dans Settings → Environment Variables :

\`\`\`env
NEXT_PUBLIC_API_URL=https://votre-backend.up.railway.app/api
\`\`\`

⚠️ Remplacer par l'URL réelle de votre backend Railway

### 4.3 Déployer

1. Cliquer "Deploy"
2. Attendre la fin du déploiement
3. Copier l'URL de production (ex: `https://gestion-rh.vercel.app`)

### 4.4 Mettre à jour CORS

Retourner dans Railway → Variables → Modifier `CORS_ORIGIN` :
\`\`\`env
CORS_ORIGIN=https://gestion-rh.vercel.app
\`\`\`

## ✅ Étape 5 : Vérification et tests

### 5.1 Tester l'application

1. **Ouvrir l'URL Vercel** dans votre navigateur
2. **Se connecter** avec :
   - Email : `admin@gestionrh.com`
   - Mot de passe : `Admin123`
3. **Tester les fonctionnalités** :
   - Ajouter un employé
   - Modifier un employé
   - Exporter en Excel
   - Consulter les statistiques

### 5.2 Vérifier les logs

**Railway** :
- Aller dans Deployments → View Logs
- Vérifier qu'il n'y a pas d'erreurs

**Vercel** :
- Aller dans Functions → View Function Logs
- Vérifier les requêtes API

## 🔧 Étape 6 : Configuration avancée (Optionnel)

### 6.1 Domaine personnalisé

**Vercel** :
1. Settings → Domains
2. Ajouter votre domaine
3. Configurer les DNS selon les instructions

**Railway** :
1. Settings → Networking
2. Ajouter un domaine personnalisé

### 6.2 Monitoring et alertes

**Vercel** :
- Analytics automatiques disponibles
- Alertes par email en cas d'erreur

**Railway** :
- Monitoring des ressources
- Alertes de déploiement

### 6.3 Sauvegardes automatiques

**MongoDB Atlas** :
- Continuous Backup activé par défaut
- Snapshots quotidiennes

## 🚨 Dépannage

### Problèmes courants

1. **Erreur CORS** :
   \`\`\`
   Solution : Vérifier CORS_ORIGIN dans Railway
   \`\`\`

2. **Erreur de connexion MongoDB** :
   \`\`\`
   Solution : Vérifier MONGODB_URI et les accès réseau
   \`\`\`

3. **Erreur 404 sur l'API** :
   \`\`\`
   Solution : Vérifier NEXT_PUBLIC_API_URL dans Vercel
   \`\`\`

4. **Erreur JWT** :
   \`\`\`
   Solution : Vérifier JWT_SECRET dans Railway
   \`\`\`

### Logs utiles

\`\`\`bash
# Logs Railway
railway logs

# Logs Vercel
vercel logs

# Test local de l'API
curl https://votre-backend.up.railway.app/api/health
\`\`\`

## 📊 Monitoring de production

### Métriques à surveiller

1. **Performance** :
   - Temps de réponse API < 500ms
   - Temps de chargement pages < 2s

2. **Disponibilité** :
   - Uptime > 99.9%
   - Erreurs < 1%

3. **Utilisation** :
   - Nombre d'utilisateurs actifs
   - Requêtes par minute

### Outils recommandés

- **Vercel Analytics** : Performance frontend
- **Railway Metrics** : Performance backend
- **MongoDB Atlas Monitoring** : Performance base de données

## 🔄 Mises à jour

### Déploiement continu

1. **Pousser les changements** :
   \`\`\`bash
   git add .
   git commit -m "Nouvelle fonctionnalité"
   git push origin main
   \`\`\`

2. **Déploiement automatique** :
   - Vercel redéploie automatiquement le frontend
   - Railway redéploie automatiquement le backend

### Rollback en cas de problème

**Vercel** :
- Deployments → Previous deployment → Promote to Production

**Railway** :
- Deployments → Previous deployment → Redeploy

---

🎉 **Félicitations !** Votre application GestionRH est maintenant en production !

**URLs importantes** :
- Frontend : `https://gestion-rh.vercel.app`
- Backend : `https://backend-production-xxxx.up.railway.app`
- Base de données : MongoDB Atlas/Railway

**Prochaines étapes** :
- Configurer un domaine personnalisé
- Mettre en place des sauvegardes
- Ajouter des métriques de monitoring
- Optimiser les performances
