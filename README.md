# 🚀 Job Application Optimizer - Système de Candidatures Adaptatives

> Optimisez vos candidatures avec l'IA : génération de CV ATS-friendly, lettres de motivation personnalisées, et insights basés sur la psychologie cognitive.

---

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Architecture technique](#architecture-technique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [API Routes](#api-routes)
- [Déploiement](#déploiement)
- [Roadmap](#roadmap)

---

## 🎯 Vue d'ensemble

Ce système utilise l'IA (Claude) pour analyser des offres d'emploi et générer automatiquement des CV et lettres de motivation optimisés pour :

1. **Passer les filtres ATS** (Applicant Tracking Systems)
2. **Exploiter la psychologie cognitive** (F-pattern, biais de confirmation)
3. **Maximiser le taux de réponse** avec A/B testing intégré
4. **Réduire le temps de candidature** de 2h à 10 minutes

### Principes éthiques

✅ **Zone Verte** (Recommandé) :
- Optimisation technique (format, mots-clés, structure)
- Reformulation professionnelle de vraies réalisations
- Normalisation des titres vers standards du marché

⚠️ **Zone Jaune** (Avec précautions) :
- Titres "fonctionnels" avec mention de l'original
- Dates en années pour masquer gaps <6 mois
- Embellissement mesuré de KPIs justifiables

🔴 **Zone Rouge** (Interdit) :
- Mensonges sur diplômes/expériences
- Invention de fausses références
- Fraude sur les dates (>6 mois)

---

## ✨ Fonctionnalités

### Phase 1 : MVP (Actuel)

- [x] **Analyse d'offres d'emploi**
  - Extraction des mots-clés techniques/business
  - Détection du niveau de séniorité
  - Score de formalisme (startup vs corporate)
  - Identification du système ATS probable

- [x] **Génération de CV optimisé**
  - 3 variantes de profil (Mobile Dev / Product Dev / PM)
  - 3 niveaux d'optimisation (Safe / Optimized / Maximized)
  - Score ATS simulé en temps réel
  - Évaluation des risques

- [x] **Système de cache intelligent**
  - Cache Supabase pour analyses d'offres (30 jours)
  - Évite les appels API redondants

### Phase 2 : Optimisations (À venir)

- [ ] **Édition complète du profil** (Formulaires)
- [ ] **Export PDF & DOCX** (Puppeteer)
- [ ] Génération de lettres de motivation
- [ ] Enrichissement automatique (scraping entreprise)
- [ ] Détecteur de "ghost jobs"

### Phase 3 : Analytics

- [ ] A/B testing tracker
- [ ] Dashboard de suivi des candidatures
- [ ] Insights de performance par variante
- [ ] Recommendations automatiques

---

## 🏗️ Architecture Technique

### Stack

```yaml
Frontend:
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui (composants)

Backend:
  - Next.js API Routes
  - Anthropic Claude API (Sonnet 4.5)
  - Puppeteer (génération PDF)

Database:
  - Supabase (PostgreSQL + Auth + Storage)
  - Row Level Security (RLS)
  - Cache avec expiration auto

Intégrations:
  - Hunter.io (recherche emails - Phase 2)
  - LinkedIn Scraper (Phase 2)
  - Brave Search API (enrichissement - Phase 2)
```

### Flux de données

```
1. Utilisateur colle une offre d'emploi
   ↓
2. API /analyze-job → Claude extrait les keywords
   ↓
3. Résultat caché dans Supabase (30 jours)
   ↓
4. API /generate-cv → Claude génère 3 versions
   ↓
5. Score ATS calculé + Risk assessment
   ↓
6. Preview → Choix de la version → Export Texte (PDF/DOCX à venir)
```

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase (gratuit)
- Clé API Claude (Anthropic)

### Étapes

```bash
# 1. Cloner le projet
git clone <repo-url>
cd job-app-optimizer

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés API

# 4. Configurer Supabase
# - Créer un projet sur https://supabase.com
# - Exécuter le script SQL dans lib/db/schema.sql
# - Copier les clés dans .env.local

# 5. Lancer en dev
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

---

## ⚙️ Configuration

### 1. Supabase Setup

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Aller dans **SQL Editor**
3. Copier-coller le contenu de `lib/db/schema.sql`
4. Exécuter le script (crée toutes les tables + RLS)
5. Récupérer les clés API :
   - Dashboard > Settings > API
   - Copier `URL` et `anon key` dans `.env.local`

### 2. Claude API

1. Créer un compte sur [console.anthropic.com](https://console.anthropic.com)
2. Générer une clé API
3. Ajouter dans `.env.local` :
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

### 3. Hunter.io (Optionnel - Phase 2)

1. Créer un compte gratuit sur [hunter.io](https://hunter.io)
2. Plan gratuit : 25 recherches/mois
3. Ajouter la clé dans `.env.local`

---

## 📖 Utilisation

### Workflow typique

1. **Créer ton profil**
   - Renseigner tes infos de base
   - Ajouter tes projets (Summer Dating, Mindful Gut, etc.)
   - Ajouter tes expériences
   - Configurer les 3 variantes de profil

2. **Analyser une offre**
   - Copier-coller le texte de l'offre
   - Le système extrait automatiquement :
     - Mots-clés techniques
     - Niveau de séniorité
     - Type d'entreprise
     - ATS probable

3. **Générer le CV**
   - Choisir ta variante (Mobile Dev / Product / PM)
   - Choisir le niveau d'optimisation
   - Preview des 3 versions
   - Score ATS affiché en temps réel

4. **Exporter**
   - ✅ **Texte brut** (Format optimisé pour copier-coller ATS)
   - 🚧 **Format PDF/DOCX** (Arrive en Phase 2)

5. **Tracker**
   - Enregistrer la candidature
   - Suivre les réponses
   - Analyser les performances (A/B testing)

---

## 🧪 Guide de Test Rapide

Pour tester l'application immédiatement avec des données réalistes :

1. Lancer le serveur : `npm run dev`
2. Aller sur : `http://localhost:3000/dashboard/analyze`
3. **Copier-coller cette offre de test** :

```text
Nous recherchons un Développeur Full-Stack React Native expérimenté
pour rejoindre notre startup en hyper-croissance.

Vous développerez des applications mobiles innovantes avec TypeScript,
Redux et Firebase. Minimum 3 ans d'expérience requis.

Compétences requises:
- React Native (obligatoire)
- TypeScript
- Node.js
- PostgreSQL

Compétences appréciées:
- Supabase
- Tests unitaires (Jest)

Profil recherché:
- Autonomie et sens de l'initiative
- Excellent esprit d'équipe
```

4. Cliquez sur **"Analyser l'offre"**
5. Une fois l'analyse terminée, cliquez sur **"Générer un CV optimisé"**
6. Choisissez une variante (ex: Mobile Dev) et un niveau (ex: Optimisé)
7. Admirez le résultat et testez l'export texte !

---

## 📁 Structure du Projet

```
job-app-optimizer/
├── app/
│   ├── api/                    # API Routes Next.js
│   │   ├── analyze-job/        # Analyse offres
│   │   ├── generate-cv/        # Génération CV
│   │   ├── generate-letter/    # Génération LM
│   │   └── ...
│   ├── (routes)/               # Pages Next.js
│   └── layout.tsx
│
├── lib/
│   ├── services/               # Services métier
│   │   ├── claude.service.ts   # Wrapper API Claude
│   │   ├── job-analyzer.service.ts
│   │   └── cv-generator.service.ts
│   │
│   ├── prompts/                # Prompts système pour Claude
│   │   ├── job-analysis.prompt.ts
│   │   └── cv-generation.prompt.ts
│   │
│   ├── types/                  # Types TypeScript
│   │   └── index.ts            # Tous les types centralisés
│   │
│   ├── db/                     # Database
│   │   ├── schema.sql          # Schéma Supabase
│   │   └── supabase.ts         # Client Supabase
│   │
│   └── utils/                  # Utilitaires
│
├── components/
│   ├── ui/                     # Composants UI (Shadcn)
│   ├── forms/                  # Formulaires
│   ├── dashboard/              # Dashboard analytics
│   └── preview/                # Preview CV/LM
│
├── public/
│   └── templates/              # Templates CV (PDF/DOCX)
│
├── .env.example                # Variables d'environnement
├── README.md                   # Documentation
└── package.json
```

---

## 📚 Documentation Détaillée

Ce projet contient une documentation technique exhaustive pour les développeurs :

- **[DEV_GUIDE.md](DEV_GUIDE.md)** : Guide complet pour les développeurs (Setup, Best Practices, Debugging).
- **[ARCHITECTURE.md](ARCHITECTURE.md)** : Vue détaillée de l'architecture, du flux de données et des choix techniques.
- **[GHOST_JOB_DETECTION.md](GHOST_JOB_DETECTION.md)** : Explication de l'algorithme de détection des fausses offres (Ghost Jobs).
- **[LIVRAISON_FINALE.md](LIVRAISON_FINALE.md)** : État des lieux précis des fonctionnalités livrées pour le MVP.

---

## 🔌 API Routes

### POST `/api/analyze-job`

Analyse une offre d'emploi.

**Request:**
```json
{
  "jobText": "string (min 100 chars)",
  "jobUrl": "string (optionnel)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "keywords": {
      "technical": ["React Native", "TypeScript", "..."],
      "business": ["autonomie", "communication", "..."],
      "tools": ["Git", "Figma", "..."]
    },
    "formalityScore": 7,
    "seniorityLevel": "mid",
    "companyType": "startup",
    "atsSystemGuess": "greenhouse",
    ...
  }
}
```

### POST `/api/generate-cv`

Génère un CV optimisé.

**Request:**
```json
{
  "userProfileId": "uuid",
  "jobAnalysis": { /* JobAnalysis object */ },
  "variant": "mobile_developer",
  "optimizationLevel": "optimized"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": { /* CVContent */ },
    "atsScore": {
      "overallScore": 82,
      "willPass": true,
      "breakdown": { ... }
    },
    "riskAssessment": {
      "overallRisk": "LOW",
      "flags": []
    }
  }
}
```

Voir `lib/types/index.ts` pour tous les types détaillés.

---

## 🚢 Déploiement

### Vercel (Recommandé)

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Déployer
vercel

# 3. Configurer les variables d'environnement
# Dashboard Vercel > Settings > Environment Variables
# Copier toutes les vars de .env.local
```

### Supabase en production

- Utiliser le même projet Supabase (pas besoin de setup spécifique)
- RLS protège automatiquement les données

### Coûts estimés

```
- Vercel: Gratuit (Hobby plan)
- Supabase: Gratuit (jusqu'à 500 MB)
- Claude API: ~10-20€/mois (50-100 candidatures)
- Hunter.io: 49€/mois (optionnel)

Total: 10-70€/mois selon usage
ROI: 1 entretien supplémentaire = job = ∞
```

---

## 🗺️ Roadmap

### ✅ Phase 1 : MVP (Complété)
- [x] Analyse d'offres avec Claude
- [x] Génération de CV (3 variantes)
- [x] Score ATS simulé
- [x] Cache Supabase
- [x] Architecture complète

### 🚧 Phase 2 : Optimisations (3-4 semaines)
- [ ] Édition complète du profil (Formulaires)
- [ ] Export PDF & DOCX
- [ ] Lettres de motivation
- [ ] Enrichissement entreprise (scraping)
- [ ] Détecteur ghost jobs

### 🔮 Phase 3 : Analytics (2 semaines)
- [ ] A/B testing tracker
- [ ] Dashboard statistiques
- [ ] Recommendations auto
- [ ] Mobile app (React Native?)

### 💡 Idées futures
- [ ] Chrome extension (extract job posting automatiquement)
- [ ] Intégration directe LinkedIn API
- [ ] Templates de CV variés (design)
- [ ] Mode "coaching" (suggestions amélioration profil)
- [ ] Multi-langue (EN, FR, DE, ES)

---

## 🤝 Contribution

Ce projet est actuellement en développement actif.

Pour contribuer :
1. Fork le repo
2. Créer une branche feature
3. Commit tes changements
4. Push et ouvrir une PR

---

## 📄 License

MIT License - utilisation libre

---

## 🙏 Crédits

- **Claude (Anthropic)** : IA pour analyse et génération
- **Supabase** : Database et auth
- **Next.js** : Framework React
- **Inspiration** : Document "f(x)" sur l'optimisation des candidatures

---

## 📞 Support

Pour questions ou bugs :
- Ouvrir une issue GitHub
- Email : [ton email]

---

**Fait avec ❤️ pour optimiser les candidatures sans compromis éthiques.**
