# Département de Mathématiques – Frontend

Application web (frontend) moderne pour la gestion académique du Département de Mathématiques.

## Stack
- React 18 (Vite)
- TailwindCSS
- React Router v6
- Axios
- Socket.IO Client

## Structure du projet
```
frontend/
  src/
    auth/                # Contexte d'authentification, garde de routes
    components/
      layout/            # Layout principal (Navbar, Sidebar)
    features/
      announcements/
      committee/
      elections/
      grades/
      home/
      messaging/
      resources/
      schedule/
      users/
      welcome/
    App.tsx
    main.tsx
    styles.css
  index.html
  package.json
  tailwind.config.js
  postcss.config.js
  vite.config.ts
```

## Prérequis
- Node.js 18+
- L’API est utilisée sur **Render** par défaut (`https://projet-dep-maths.onrender.com`), configurable via `VITE_API_URL` et `VITE_SOCKET_URL` dans `.env`.

## Installation et démarrage
```bash
cd frontend
npm install
npm run dev
```
Le serveur de dev Vite s’ouvre en général sur le port **5173** (voir la console).

## Configuration
- **API & WebSocket** : `frontend/.env` — `VITE_API_URL` et `VITE_SOCKET_URL` (même hôte que l’API en production).
- Couleurs principales définies dans `tailwind.config.js` (bleu/blanc/gris).
- Styles globaux dans `src/styles.css`.
- Layout commun : `Navbar` + zone de contenu dans `src/components/layout`.

## Authentification & rôles
- Contexte d’authentification: `src/auth/AuthContext.tsx`
- Garde de routes (rôles): `src/auth/ProtectedRoute.tsx`
- Les pages de connexion et d’inscription appellent le backend JWT (`/api/auth/login`, `/api/auth/register`).
- Rôles pris en charge: `Admin`, `Professor`, `Student` avec affichage conditionnel dans la `Sidebar`.

## Pages & fonctionnalités (placeholders)
- Utilisateurs: liste, profil, création/modification (à connecter à l’API)
- Comité de classe: dépôt, vote, résultats
- Élections: gestion des postes, candidats, vote sécurisé, tableau des résultats
- Notes: saisie professeurs, consultation, moyennes
- Emploi du temps: vue par classe/jour, édition rapide (modale à ajouter)
- Cours/Ressources: upload/téléchargement, classement (intégrer API + storage)
- Messagerie: Socket.IO (URL backend à ajuster)
- Annonces: fil d’actualités
- Bienvenue: page d’accueil nouveaux étudiants + formulaire d’inscription interne

## À connecter au backend
- Remplacer les placeholders de `LoginPage`/`RegisterPage` par des appels Axios au backend JWT (ex: `/api/auth/login`, `/api/auth/register`).
- Ajouter un intercepteur Axios pour attacher le token depuis le `AuthContext`.
- Intégrer la pagination/filtrage/tri côté `UsersPage`.
- Implémenter la modale d’édition rapide dans `SchedulePage`.
- Implémenter le téléversement (input type="file") et liens de téléchargement dans `ResourcesPage`.

## Déploiement
- Build de production:
```bash
npm run build
npm run preview  # test local du build
```
- Servez le contenu du dossier `dist/` via un serveur statique (Nginx, Vercel, Netlify, etc.).

## Accessibilité & bonnes pratiques
- Composants modulaires, labels/formulaires associés, focus visible.
- Couleurs avec contraste suffisant (gamme `primary` + gris Tailwind).
- Navigation clavier testée sur les pages d’auth et de liste.

## Licence
Usage interne au département (adapter selon besoin).
