# 🔧 Guide de Résolution des Erreurs de Déploiement

## 🚨 Erreurs Communes et Solutions

### 1. **Erreur: "Module not found"**
**Solution**: Vérifiez que toutes les dépendances sont dans `package.json`
\`\`\`bash
npm install --save-dev @types/node @types/react @types/react-dom
\`\`\`

### 2. **Erreur: "CORS policy"**
**Solution**: Configurez correctement CORS dans le backend
- Vérifiez `CORS_ORIGIN` dans les variables d'environnement
- Utilisez l'URL exacte de votre frontend déployé

### 3. **Erreur: "MongoDB connection failed"**
**Solutions**:
- Vérifiez `MONGODB_URI` dans les variables d'environnement
- Pour MongoDB Atlas: ajoutez `0.0.0.0/0` dans Network Access
- Format correct: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

### 4. **Erreur: "JWT secret not defined"**
**Solution**: Générez un JWT secret fort
\`\`\`bash
# Générer un secret de 32 caractères
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

### 5. **Erreur: "Port already in use"**
**Solution**: Utilisez la variable d'environnement PORT
\`\`\`javascript
const PORT = process.env.PORT || 5000
\`\`\`

### 6. **Erreur: "Build failed"**
**Solutions**:
- Vérifiez les erreurs TypeScript
- Corrigez les erreurs ESLint
- Vérifiez que toutes les importations sont correctes

## 📋 Checklist de Déploiement

### Backend (Railway/Heroku)
- [ ] `package.json` avec `engines` spécifiés
- [ ] Variables d'environnement configurées
- [ ] `MONGODB_URI` correcte
- [ ] `JWT_SECRET` généré
- [ ] `CORS_ORIGIN` configuré
- [ ] Port dynamique (`process.env.PORT`)

### Frontend (Vercel/Netlify)
- [ ] `next.config.js` configuré
- [ ] `NEXT_PUBLIC_API_URL` configurée
- [ ] Build sans erreurs TypeScript
- [ ] Toutes les dépendances installées
- [ ] Routes correctement configurées

## 🔄 Étapes de Déploiement Corrigées

### 1. Préparer le Backend
\`\`\`bash
cd backend
npm install
npm run build  # Si nécessaire
\`\`\`

### 2. Tester localement
\`\`\`bash
npm run dev
# Vérifier que l'API répond sur http://localhost:5000/health
\`\`\`

### 3. Déployer sur Railway
1. Connecter le repository GitHub
2. Configurer les variables d'environnement
3. Déployer automatiquement

### 4. Préparer le Frontend
\`\`\`bash
npm install
npm run build
npm run start  # Tester le build
\`\`\`

### 5. Déployer sur Vercel
1. Connecter le repository GitHub
2. Configurer `NEXT_PUBLIC_API_URL`
3. Déployer automatiquement

## 🛠️ Variables d'Environnement Requises

### Backend (Railway)
\`\`\`env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gestion-rh
JWT_SECRET=votre_secret_32_caracteres_minimum
JWT_EXPIRE=7d
CORS_ORIGIN=https://votre-app.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
\`\`\`

### Frontend (Vercel)
\`\`\`env
NEXT_PUBLIC_API_URL=https://votre-backend.up.railway.app/api
\`\`\`

## 🔍 Tests de Vérification

### Backend
\`\`\`bash
# Test de santé
curl https://votre-backend.up.railway.app/health

# Test API
curl https://votre-backend.up.railway.app/api/health
\`\`\`

### Frontend
\`\`\`bash
# Vérifier que l'app se charge
curl https://votre-app.vercel.app

# Vérifier la page de login
curl https://votre-app.vercel.app/admin/login
\`\`\`

## 🚨 En cas d'erreur persistante

1. **Vérifiez les logs** :
   - Railway: Deployments → View Logs
   - Vercel: Functions → View Function Logs

2. **Testez localement** avec les mêmes variables d'environnement

3. **Vérifiez la connectivité** :
   \`\`\`bash
   ping votre-backend.up.railway.app
   \`\`\`

4. **Redéployez** après correction :
   \`\`\`bash
   git add .
   git commit -m "Fix deployment issues"
   git push origin main
