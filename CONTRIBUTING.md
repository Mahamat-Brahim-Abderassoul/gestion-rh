# 🤝 Guide de Contribution - GestionRH

Merci de votre intérêt pour contribuer au projet GestionRH ! Ce guide vous explique comment participer au développement.

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Structure du projet](#structure-du-projet)
- [Configuration de développement](#configuration-de-développement)
- [Standards de code](#standards-de-code)
- [Tests](#tests)
- [Pull Requests](#pull-requests)

## 📜 Code de conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite :

- Soyez respectueux et inclusif
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est le mieux pour la communauté
- Montrez de l'empathie envers les autres membres

## 🚀 Comment contribuer

### Types de contributions

- 🐛 **Correction de bugs**
- ✨ **Nouvelles fonctionnalités**
- 📚 **Amélioration de la documentation**
- 🎨 **Améliorations UI/UX**
- ⚡ **Optimisations de performance**
- 🧪 **Ajout de tests**

### Processus de contribution

1. **Fork** le repository
2. **Créer** une branche pour votre fonctionnalité
3. **Développer** et tester vos changements
4. **Commiter** avec des messages clairs
5. **Pousser** vers votre fork
6. **Créer** une Pull Request

## 🏗️ Structure du projet

\`\`\`
gestion-rh/
├── app/                    # Pages Next.js
├── backend/               # API Node.js
├── components/            # Composants React
├── contexts/             # Contextes React
├── hooks/                # Hooks personnalisés
├── lib/                  # Utilitaires
├── types/                # Types TypeScript
└── docs/                 # Documentation
\`\`\`

## ⚙️ Configuration de développement

### Prérequis

- Node.js 18+
- MongoDB (local ou Atlas)
- Git

### Installation

\`\`\`bash
# Cloner votre fork
git clone https://github.com/VOTRE_USERNAME/gestion-rh.git
cd gestion-rh

# Installer les dépendances frontend
npm install

# Installer les dépendances backend
cd backend
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Modifier .env avec vos valeurs

# Initialiser la base de données
npm run seed

# Démarrer en mode développement
npm run dev
\`\`\`

## 📝 Standards de code

### TypeScript

- Utiliser TypeScript pour tout nouveau code
- Définir des types explicites
- Éviter `any`, préférer `unknown`

### React

- Composants fonctionnels avec hooks
- Props typées avec interfaces
- Utiliser `useCallback` et `useMemo` pour l'optimisation

### Node.js

- Utiliser async/await au lieu de callbacks
- Gestion d'erreurs appropriée
- Validation des données d'entrée

### Style de code

\`\`\`typescript
// ✅ Bon
interface UserProps {
  name: string
  email: string
  isActive: boolean
}

const UserCard: React.FC<UserProps> = ({ name, email, isActive }) => {
  return (
    <div className="p-4 border rounded">
      <h3>{name}</h3>
      <p>{email}</p>
      {isActive && <span>Actif</span>}
    </div>
  )
}

// ❌ Éviter
const UserCard = (props: any) => {
  return <div>{props.name}</div>
}
\`\`\`

### Conventions de nommage

- **Fichiers** : kebab-case (`user-card.tsx`)
- **Composants** : PascalCase (`UserCard`)
- **Variables/fonctions** : camelCase (`getUserData`)
- **Constants** : UPPER_SNAKE_CASE (`API_BASE_URL`)

## 🧪 Tests

### Frontend

\`\`\`bash
# Lancer les tests
npm run test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage
\`\`\`

### Backend

\`\`\`bash
cd backend

# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration
\`\`\`

### Écriture de tests

\`\`\`typescript
// Exemple de test de composant
import { render, screen } from '@testing-library/react'
import UserCard from './user-card'

describe('UserCard', () => {
  it('should display user information', () => {
    render(
      <UserCard 
        name="John Doe" 
        email="john@example.com" 
        isActive={true} 
      />
    )
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Actif')).toBeInTheDocument()
  })
})
\`\`\`

## 📤 Pull Requests

### Avant de soumettre

- [ ] Tests passent
- [ ] Code formaté (Prettier)
- [ ] Pas d'erreurs ESLint
- [ ] Documentation mise à jour
- [ ] Changements testés localement

### Template de PR

\`\`\`markdown
## 📝 Description

Brève description des changements apportés.

## 🔄 Type de changement

- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## 🧪 Tests

- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests manuels effectués
- [ ] Tous les tests passent

## 📸 Screenshots (si applicable)

Ajouter des captures d'écran pour les changements UI.

## ✅ Checklist

- [ ] Code auto-documenté et commenté
- [ ] Changements testés localement
- [ ] Documentation mise à jour
- [ ] Pas de conflits de merge
\`\`\`

### Processus de review

1. **Soumission** de la PR
2. **Review automatique** (CI/CD)
3. **Review manuelle** par les mainteneurs
4. **Corrections** si nécessaires
5. **Merge** après approbation

## 🐛 Signaler des bugs

### Template d'issue

\`\`\`markdown
## 🐛 Description du bug

Description claire et concise du problème.

## 🔄 Étapes pour reproduire

1. Aller à '...'
2. Cliquer sur '...'
3. Voir l'erreur

## ✅ Comportement attendu

Description de ce qui devrait se passer.

## 📸 Screenshots

Ajouter des captures d'écran si applicable.

## 🖥️ Environnement

- OS: [ex: Windows 10]
- Navigateur: [ex: Chrome 91]
- Version: [ex: 1.0.0]

## 📝 Informations supplémentaires

Tout autre contexte utile.
\`\`\`

## 💡 Proposer des fonctionnalités

### Template de feature request

\`\`\`markdown
## 🚀 Fonctionnalité proposée

Description claire de la fonctionnalité souhaitée.

## 🎯 Problème résolu

Quel problème cette fonctionnalité résout-elle ?

## 💭 Solution proposée

Description de la solution envisagée.

## 🔄 Alternatives considérées

Autres solutions envisagées.

## 📝 Informations supplémentaires

Contexte supplémentaire ou captures d'écran.
\`\`\`

## 🏷️ Versioning

Nous utilisons [Semantic Versioning](https://semver.org/) :

- **MAJOR** : Changements incompatibles
- **MINOR** : Nouvelles fonctionnalités compatibles
- **PATCH** : Corrections de bugs

## 📞 Support

- **Issues GitHub** : Pour les bugs et features
- **Discussions** : Pour les questions générales
- **Email** : contact@gestionrh.com

## 🙏 Remerciements

Merci à tous les contributeurs qui rendent ce projet possible !

---

Happy coding! 🚀
