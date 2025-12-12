# 🏗️ Architecture Technique Détaillée

## 📐 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Formulaires │  │   Preview    │  │  Dashboard   │     │
│  │   Profil/CV  │  │   CV/Letter  │  │  Analytics   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   API ROUTES (Next.js)                      │
│  /api/analyze-job  /api/generate-cv  /api/track-application│
└─────────┬─────────────────────────────────────────┬─────────┘
          │                                         │
          ▼                                         ▼
┌──────────────────────┐                  ┌──────────────────┐
│   SERVICES LAYER     │                  │   DATABASE       │
│  ┌────────────────┐  │                  │   (Supabase)     │
│  │ Claude Service │  │◄─────────────────┤  PostgreSQL     │
│  │ Job Analyzer   │  │                  │  + RLS           │
│  │ CV Generator   │  │                  │  + Cache         │
│  └────────────────┘  │                  │  + Storage       │
└──────────────────────┘                  └──────────────────┘
          │
          ▼
┌──────────────────────┐
│  EXTERNAL APIs       │
│  - Anthropic Claude  │
│  - Hunter.io         │
│  - Web Scraping      │
└──────────────────────┘
```

---

## 📂 Structure des Dossiers

### `/app` - Application Next.js (App Router)

```
app/
├── api/                        # API Routes
│   ├── analyze-job/
│   │   └── route.ts           # POST: Analyse offre d'emploi
│   ├── generate-cv/
│   │   └── route.ts           # POST: Génère CV optimisé
│   ├── generate-letter/
│   │   └── route.ts           # POST: Génère lettre motivation
│   ├── enrich-company/
│   │   └── route.ts           # POST: Scrape infos entreprise
│   ├── find-contacts/
│   │   └── route.ts           # POST: Trouve emails décisionnaires
│   ├── detect-ghost-job/
│   │   └── route.ts           # POST: Détecte offres fantômes
│   └── track-application/
│       └── route.ts           # POST: Enregistre candidature
│
├── (dashboard)/               # Pages protégées
│   ├── profile/              # Gestion profil
│   ├── applications/         # Liste candidatures
│   └── analytics/            # Stats A/B testing
│
├── (public)/                 # Pages publiques
│   ├── login/
│   └── signup/
│
├── layout.tsx                # Layout principal
└── page.tsx                  # Page d'accueil
```

### `/lib` - Business Logic

```
lib/
├── services/                  # Services métier
│   ├── claude.service.ts     # Wrapper API Claude
│   ├── job-analyzer.service.ts   # Analyse offres
│   ├── cv-generator.service.ts   # Génération CV
│   ├── letter-generator.service.ts   # Génération LM
│   ├── company-enricher.service.ts   # Scraping
│   ├── contact-finder.service.ts     # Hunter.io
│   └── pdf-generator.service.ts      # Puppeteer
│
├── prompts/                   # Prompts Claude
│   ├── job-analysis.prompt.ts
│   ├── cv-generation.prompt.ts
│   ├── letter-generation.prompt.ts
│   └── company-research.prompt.ts
│
├── types/                     # Types TypeScript
│   └── index.ts              # Tous les types centralisés
│
├── db/                        # Database
│   ├── schema.sql            # Schéma Supabase complet
│   ├── supabase.ts           # Client Supabase
│   └── queries.ts            # Queries réutilisables
│
└── utils/                     # Utilitaires
    ├── validators.ts         # Zod schemas
    ├── formatters.ts         # Date, text formatting
    └── constants.ts          # Constantes globales
```

### `/components` - Composants React

```
components/
├── ui/                        # Composants UI de base (Shadcn)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
│
├── forms/                     # Formulaires
│   ├── ProfileForm.tsx       # Édition profil
│   ├── JobAnalysisForm.tsx   # Paste job offer
│   └── ApplicationForm.tsx   # Track candidature
│
├── preview/                   # Prévisualisation
│   ├── CVPreview.tsx         # Affiche CV généré
│   ├── LetterPreview.tsx     # Affiche LM
│   └── ScoreCard.tsx         # ATS Score + Risk
│
└── dashboard/                 # Dashboard
    ├── ApplicationsList.tsx  # Liste candidatures
    ├── ABTestChart.tsx       # Graphiques A/B
    └── StatsCards.tsx        # KPIs
```

---

## 🔄 Flux de Données Détaillés

### 1. Analyse d'Offre d'Emploi

```
User Input (jobText)
  │
  ▼
POST /api/analyze-job
  │
  ├─► Check cache Supabase (job_text_hash)
  │   ├─► Hit → Return cached analysis
  │   └─► Miss → Continue
  │
  ▼
JobAnalyzerService.analyzeJob()
  │
  ▼
ClaudeService.sendPromptJSON()
  ├─► System Prompt: JOB_ANALYSIS_SYSTEM_PROMPT
  └─► User Prompt: createJobAnalysisPrompt(jobText)
  │
  ▼
Claude API (Sonnet 4.5)
  │
  ▼
Parse JSON Response → JobAnalysis
  │
  ├─► Cache in Supabase (30 days expiry)
  └─► Return to client
```

**Types impliqués :**
- Input: `{ jobText: string, jobUrl?: string }`
- Output: `JobAnalysis`

### 2. Génération de CV

```
User selects:
  - Profile variant (mobile_developer, product_developer, project_manager)
  - Optimization level (safe, optimized, maximized)
  │
  ▼
POST /api/generate-cv
  │
  ▼
Fetch UserProfile from Supabase
  ├─► user_profiles
  ├─► projects
  ├─► experiences
  ├─► education
  └─► skills
  │
  ▼
CVGeneratorService.generateCV()
  │
  ├─► Build prompt with:
  │   ├─► User profile data
  │   ├─► Job analysis (keywords, context)
  │   └─► Variant config
  │
  ▼
ClaudeService.sendPromptJSON()
  │
  ▼
Claude generates CVContent
  │
  ├─► Calculate ATS Score
  │   ├─► Format parsable: 100%
  │   ├─► Keyword match: X%
  │   ├─► Structure standard: 100%
  │   └─► Chronology: 100%
  │
  ├─► Assess Risks
  │   ├─► Normalized titles → LOW
  │   ├─► Strong claims → MEDIUM
  │   └─► Fabrications → HIGH (none)
  │
  └─► Return CVGenerationResult
      ├─► content (CVContent)
      ├─► atsScore (ATSScore)
      └─► riskAssessment (RiskAssessment)
```

**Types impliqués :**
- Input: `CVGenerationRequest`
- Output: `CVGenerationResult`

### 3. Export PDF/DOCX

```
User clicks "Export"
  │
  ▼
POST /api/export-cv
  │
  ├─► Format: DOCX (for ATS upload)
  │   └─► Use template in /public/templates/cv-ats.docx
  │
  └─► Format: PDF (for email)
      └─► Puppeteer.render()
          ├─► Load HTML template
          ├─► Inject CVContent
          └─► Generate PDF
  │
  ▼
Upload to Supabase Storage
  │
  ▼
Return download URL
```

---

## 💾 Schéma de Base de Données

### Tables Principales

#### `user_profiles`
Profil utilisateur central.

```sql
id UUID PRIMARY KEY
user_id UUID (auth.users FK)
first_name, last_name, email, phone
location, linkedin_url, github_url, portfolio_url
profile_variants JSONB  -- {mobile_developer: {...}, ...}
target_role, target_salary, availability
created_at, updated_at
```

#### `projects`
Projets personnels/professionnels.

```sql
id UUID PRIMARY KEY
user_profile_id UUID FK
name, description, status
tech JSONB  -- ["React Native", "TypeScript"]
url, app_store_url, github_url
kpis JSONB, highlights JSONB
start_date, end_date
display_order INT
```

#### `experiences`
Expériences professionnelles.

```sql
id UUID PRIMARY KEY
user_profile_id UUID FK
title, title_normalized
company, location
start_date, end_date
date_format ENUM('full', 'year-only')
description TEXT
achievements JSONB, tech JSONB
risk_level ENUM('LOW', 'MEDIUM', 'HIGH')
display_order INT
```

#### `education`
Formation académique.

```sql
id UUID PRIMARY KEY
user_profile_id UUID FK
degree, institution, field, location
start_date, end_date
highlights JSONB
display_order INT
```

#### `skills`
Compétences.

```sql
id UUID PRIMARY KEY
user_profile_id UUID FK
category ENUM('technical', 'business', 'language')
name, level
proficiency INT (1-5)
display_order INT
```

#### `job_analyses` (Cache)
Cache des analyses d'offres.

```sql
id UUID PRIMARY KEY
job_text_hash VARCHAR(64) UNIQUE
job_url, company_name, job_title
keywords JSONB
keyword_context JSONB
formality_score, seniority_level, company_type
ats_system_guess
salary_range JSONB
required_years_experience
remote_policy
created_at, expires_at (30 days)
```

#### `applications`
Tracking des candidatures.

```sql
id UUID PRIMARY KEY
user_profile_id UUID FK
job_title, company, job_url
cv_variant, letter_variant
channel ENUM('linkedin', 'direct_email', 'company_website', 'other')
status ENUM('pending', 'sent', 'response_positive', 'response_negative', 'no_response')
applied_date, response_date
notes TEXT
cv_file_path, letter_file_path (Supabase Storage)
```

#### `company_enrichments` (Cache)
Données enrichies sur les entreprises.

```sql
id UUID PRIMARY KEY
company_name VARCHAR(255) UNIQUE
website, linkedin_url
recent_achievements JSONB
pain_points JSONB
culture_keywords JSONB
notable_products JSONB
recent_news JSONB
employee_count, funding
created_at, updated_at, expires_at (7 days)
```

### Vues Matérialisées

#### `ab_test_results`
Analytics A/B testing (refresh automatique).

```sql
SELECT
  cv_variant,
  COUNT(*) as total_applications,
  COUNT(CASE WHEN status = 'response_positive' THEN 1 END) as positive_responses,
  (positive_responses / total_applications * 100) as response_rate,
  AVG(response_date - applied_date) as avg_days_to_response
FROM applications
GROUP BY cv_variant;
```

---

## 🔐 Sécurité

### Row Level Security (RLS)

Toutes les tables utilisateur ont RLS activé :

```sql
-- Exemple pour user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

### Variables d'Environnement

- **Côté client** : `NEXT_PUBLIC_*` (exposées)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **Côté serveur** : Secrets (jamais exposés)
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ANTHROPIC_API_KEY`
  - `HUNTER_IO_API_KEY`

---

## 📊 Performance

### Cache Strategy

1. **Analyses d'offres** : Cache 30 jours (job_analyses)
2. **Enrichissements entreprise** : Cache 7 jours (company_enrichments)
3. **A/B test results** : Vue matérialisée (refresh quotidien)

### Optimisations

- **Edge Functions** : API routes déployées sur Vercel Edge
- **Streaming** : Claude API avec streaming pour feedback temps réel (Phase 2)
- **Lazy Loading** : Composants UI chargés à la demande
- **Image Optimization** : Next.js Image component

---

## 🚀 Évolutivité

### Limitations Actuelles (MVP)

- **Claude API** : Rate limit 50 req/min (largement suffisant pour 1 user)
- **Supabase Free** : 500 MB storage, 2 GB bandwidth/month
- **Vercel Hobby** : 100 GB bandwidth/month

### Scaling Strategy (si >1000 users)

1. **Upgrade Supabase** : Pro plan ($25/mois) → 8 GB storage
2. **Upgrade Vercel** : Pro plan ($20/mois) → Unlimited bandwidth
3. **Claude caching** : Implement prompt caching (Phase 2)
4. **Queue system** : BullMQ pour jobs longs (génération PDF bulk)

---

## 🧪 Testing

### Types de tests à implémenter

```
tests/
├── unit/
│   ├── services/
│   │   ├── claude.service.test.ts
│   │   └── cv-generator.service.test.ts
│   └── utils/
│       └── validators.test.ts
│
├── integration/
│   └── api/
│       ├── analyze-job.test.ts
│       └── generate-cv.test.ts
│
└── e2e/
    └── user-flow.spec.ts  # Playwright
```

---

## 📈 Monitoring (Future)

- **Sentry** : Error tracking
- **Vercel Analytics** : Performance monitoring
- **Supabase Logs** : Database queries
- **Custom metrics** :
  - Temps de génération CV moyen
  - Taux de cache hit/miss
  - Distribution des scores ATS

---

**Architecture conçue pour être simple, maintenable et scalable. 🏗️**
