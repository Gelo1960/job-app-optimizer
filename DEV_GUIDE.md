# 👨‍💻 Guide du Développeur - Prochaines Étapes

Ange, voici un guide pour continuer le développement du système. L'architecture backend est **100% complète**, il reste à développer le frontend et quelques features avancées.

---

## ✅ Ce qui est FAIT

### Backend & Architecture
- [x] Structure Next.js 14 avec TypeScript
- [x] Schéma Supabase complet (10 tables + RLS + triggers)
- [x] Service Claude API avec prompts optimisés
- [x] Service d'analyse d'offres (avec cache)
- [x] Service de génération de CV (3 variantes)
- [x] API Routes pour analyse et génération
- [x] Types TypeScript exhaustifs
- [x] Documentation complète (README, GETTING_STARTED, ARCHITECTURE)

### Fichiers Créés
```
✓ lib/types/index.ts (tous les types)
✓ lib/db/schema.sql (schéma complet)
✓ lib/db/supabase.ts (client)
✓ lib/services/claude.service.ts
✓ lib/services/job-analyzer.service.ts
✓ lib/services/cv-generator.service.ts
✓ lib/prompts/job-analysis.prompt.ts
✓ lib/prompts/cv-generation.prompt.ts
✓ app/api/analyze-job/route.ts
✓ app/api/generate-cv/route.ts
✓ .env.example
✓ README.md
✓ GETTING_STARTED.md
✓ ARCHITECTURE.md
```

---

## 🚧 Ce qu'il reste à faire

### Phase 1 : MVP Frontend (2-3 semaines)

#### 1.1 Pages principales

```typescript
// app/page.tsx - Landing page
export default function Home() {
  return (
    <div>
      <h1>Job Application Optimizer</h1>
      <Link href="/dashboard">Commencer</Link>
    </div>
  )
}

// app/dashboard/page.tsx - Dashboard principal
// TODO: Créer interface avec 3 sections:
// - Analyser une offre
// - Générer un CV
// - Mes candidatures
```

#### 1.2 Formulaire de profil

**Fichier à créer** : `components/forms/ProfileForm.tsx`

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  // ... autres champs
})

export function ProfileForm() {
  const form = useForm({
    resolver: zodResolver(profileSchema)
  })

  async function onSubmit(data) {
    // Sauvegarder dans Supabase
    const { error } = await supabase
      .from('user_profiles')
      .upsert(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Champs du formulaire */}
    </form>
  )
}
```

**Features à implémenter** :
- [ ] Formulaire infos de base (nom, email, téléphone, etc.)
- [ ] Gestion des projets (add/edit/delete)
- [ ] Gestion des expériences (avec normalisation titres)
- [ ] Gestion de l'éducation
- [ ] Gestion des compétences (technical/business/languages)
- [ ] Configuration des 3 variantes de profil

#### 1.3 Interface d'analyse d'offre

**Fichier à créer** : `components/forms/JobAnalysisForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { JobAnalysis } from '@/lib/types'

export function JobAnalysisForm() {
  const [jobText, setJobText] = useState('')
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  async function analyzeJob() {
    setLoading(true)

    const res = await fetch('/api/analyze-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobText })
    })

    const { data } = await res.json()
    setAnalysis(data)
    setLoading(false)
  }

  return (
    <div>
      <textarea
        value={jobText}
        onChange={(e) => setJobText(e.target.value)}
        placeholder="Colle le texte de l'offre d'emploi ici..."
        rows={10}
      />

      <button onClick={analyzeJob} disabled={loading}>
        {loading ? 'Analyse en cours...' : 'Analyser'}
      </button>

      {analysis && (
        <div>
          {/* Afficher les résultats */}
          <h3>Mots-clés techniques :</h3>
          <ul>
            {analysis.keywords.technical.map(k => <li>{k}</li>)}
          </ul>
          {/* ... autres infos */}
        </div>
      )}
    </div>
  )
}
```

**Features à implémenter** :
- [ ] Textarea pour coller l'offre
- [ ] Bouton d'analyse (avec loading state)
- [ ] Affichage des keywords (technical/business/tools)
- [ ] Score de formalisme (gauge visuelle)
- [ ] Type d'entreprise et séniorité
- [ ] Bouton "Générer CV" → passe à l'étape suivante

#### 1.4 Interface de génération de CV

**Fichier à créer** : `components/CVGeneratorWizard.tsx`

```typescript
'use client'

import { useState } from 'react'
import { JobAnalysis, CVGenerationResult } from '@/lib/types'

export function CVGeneratorWizard({
  jobAnalysis
}: {
  jobAnalysis: JobAnalysis
}) {
  const [variant, setVariant] = useState('mobile_developer')
  const [optimizationLevel, setOptimizationLevel] = useState('optimized')
  const [result, setResult] = useState<CVGenerationResult | null>(null)

  async function generateCV() {
    const res = await fetch('/api/generate-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userProfileId: 'xxx', // À récupérer depuis auth
        jobAnalysis,
        variant,
        optimizationLevel
      })
    })

    const { data } = await res.json()
    setResult(data)
  }

  return (
    <div>
      {/* Étape 1: Choix de la variante */}
      <select value={variant} onChange={e => setVariant(e.target.value)}>
        <option value="mobile_developer">Développeur Mobile</option>
        <option value="product_developer">Développeur Produit</option>
        <option value="project_manager">Chef de Projet</option>
      </select>

      {/* Étape 2: Niveau d'optimisation */}
      <select value={optimizationLevel} onChange={e => setOptimizationLevel(e.target.value)}>
        <option value="safe">Safe (Factuel)</option>
        <option value="optimized">Optimisé (Recommandé)</option>
        <option value="maximized">Maximisé (Zone jaune)</option>
      </select>

      <button onClick={generateCV}>Générer</button>

      {result && (
        <div>
          {/* Preview du CV */}
          <CVPreview content={result.content} />

          {/* Score ATS */}
          <ATSScoreCard score={result.atsScore} />

          {/* Risk Assessment */}
          <RiskAssessmentCard assessment={result.riskAssessment} />
        </div>
      )}
    </div>
  )
}
```

**Features à implémenter** :
- [ ] Sélecteur de variante (3 options)
- [ ] Sélecteur de niveau d'optimisation (3 options)
- [ ] Preview du CV généré (texte ou HTML)
- [ ] Score ATS avec breakdown (gauge circulaire)
- [ ] Risk assessment avec flags détaillés
- [ ] Boutons d'export (PDF, DOCX, Texte)

#### 1.5 Preview de CV

**Fichier à créer** : `components/preview/CVPreview.tsx`

```typescript
import { CVContent } from '@/lib/types'

export function CVPreview({ content }: { content: CVContent }) {
  return (
    <div className="cv-preview">
      {/* Header */}
      <div>
        <h1>{content.header.name}</h1>
        <h2>{content.header.title}</h2>
        <div>{content.header.contact.join(' | ')}</div>
      </div>

      {/* Professional Summary */}
      <section>
        <h3>Profil Professionnel</h3>
        <p>{content.professionalSummary}</p>
      </section>

      {/* Skills */}
      <section>
        <h3>Compétences</h3>
        {content.skills.map(skillGroup => (
          <div key={skillGroup.category}>
            <strong>{skillGroup.category}:</strong> {skillGroup.items.join(', ')}
          </div>
        ))}
      </section>

      {/* Experience */}
      <section>
        <h3>Expérience Professionnelle</h3>
        {content.experience.map(exp => (
          <div key={exp.title}>
            <h4>{exp.title} - {exp.company}</h4>
            <p>{exp.period}</p>
            <ul>
              {exp.bullets.map(bullet => <li>{bullet}</li>)}
            </ul>
          </div>
        ))}
      </section>

      {/* Projects (si présents) */}
      {content.projects && (
        <section>
          <h3>Projets</h3>
          {content.projects.map(project => (
            <div key={project.name}>
              <h4>{project.name}</h4>
              <p>{project.description}</p>
              <p><strong>Technologies:</strong> {project.tech.join(', ')}</p>
              <ul>
                {project.highlights.map(h => <li>{h}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      <section>
        <h3>Formation</h3>
        {content.education.map(edu => (
          <div key={edu.degree}>
            <strong>{edu.degree}</strong> - {edu.institution} ({edu.period})
          </div>
        ))}
      </section>
    </div>
  )
}
```

**Styles à ajouter** : Utilise Tailwind pour un rendu propre.

---

### Phase 2 : Features Avancées (2-3 semaines)

#### 2.1 Génération de Lettres de Motivation

**Fichier à créer** : `lib/prompts/letter-generation.prompt.ts`

```typescript
export const createLetterGenerationPrompt = (
  profile: UserProfile,
  jobAnalysis: JobAnalysis,
  companyInfo: CompanyEnrichment
) => `
GÉNÈRE une lettre de motivation optimisée.

PROFIL: ${JSON.stringify(profile)}
OFFRE: ${JSON.stringify(jobAnalysis)}
ENTREPRISE: ${JSON.stringify(companyInfo)}

STRUCTURE (5 paragraphes):
1. HOOK: Commence par un pain point identifié dans l'offre
2. CRÉDIBILITÉ: Tes projets concrets (Summer Dating, etc.)
3. VALEUR UNIQUE: Profil hybride dev/business
4. FIT CULTUREL: Recherche spécifique sur l'entreprise
5. CTA: Appel à l'action clair

TON: ${jobAnalysis.formalityScore > 7 ? 'Formel' : 'Professionnel direct'}

Retourne en JSON:
{
  "greeting": "Madame, Monsieur,",
  "hook": "...",
  "credibility": "...",
  "uniqueValue": "...",
  "culturalFit": "...",
  "cta": "...",
  "signature": "Cordialement,\nAnge Yaokouassi"
}
`
```

**API Route à créer** : `app/api/generate-letter/route.ts` (similaire à generate-cv)

#### 2.2 Détecteur de Ghost Jobs

**Fichier à créer** : `lib/services/ghost-job-detector.service.ts`

```typescript
import { GhostJobAnalysis } from '../types'

export class GhostJobDetectorService {
  static async detectGhostJob(
    jobUrl: string,
    jobText: string
  ): Promise<GhostJobAnalysis> {
    const redFlags = {
      age: await this.getJobAge(jobUrl),
      reposted: await this.getRepostCount(jobUrl),
      vague: this.analyzeVagueness(jobText),
      noSalary: !this.hasSalaryRange(jobText),
      generic: this.detectGenericPhrases(jobText)
    }

    const score = Object.values(redFlags).filter(Boolean).length

    return {
      isGhostJob: score >= 3,
      confidence: score / 5,
      redFlags,
      recommendation: score >= 3 ? 'SKIP' : 'APPLY',
      reasoning: this.generateReasoning(redFlags)
    }
  }

  private static analyzeVagueness(text: string): boolean {
    // Logique: job description < 500 chars = suspect
    return text.length < 500
  }

  private static detectGenericPhrases(text: string): string[] {
    const phrases = [
      'dynamic team',
      'fast-paced environment',
      'wear many hats',
      'competitive salary'
    ]
    return phrases.filter(p => text.toLowerCase().includes(p))
  }

  // ... autres méthodes
}
```

#### 2.3 Export PDF avec Puppeteer

**Fichier à créer** : `lib/services/pdf-generator.service.ts`

```typescript
import puppeteer from 'puppeteer'
import { CVContent } from '../types'

export class PDFGeneratorService {
  static async generatePDF(cvContent: CVContent): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    // Template HTML du CV
    const html = this.buildHTML(cvContent)

    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1.5cm',
        bottom: '1cm',
        left: '1.5cm'
      }
    })

    await browser.close()

    return pdf
  }

  private static buildHTML(cv: CVContent): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          h1 { font-size: 24px; margin-bottom: 5px; }
          h2 { font-size: 18px; color: #333; margin-bottom: 10px; }
          .contact { font-size: 12px; margin-bottom: 20px; }
          /* ... autres styles */
        </style>
      </head>
      <body>
        <h1>${cv.header.name}</h1>
        <h2>${cv.header.title}</h2>
        <div class="contact">${cv.header.contact.join(' | ')}</div>
        <!-- ... reste du CV -->
      </body>
      </html>
    `
  }
}
```

**API Route** : `app/api/export-pdf/route.ts`

```typescript
import { PDFGeneratorService } from '@/lib/services/pdf-generator.service'

export async function POST(request: Request) {
  const { cvContent } = await request.json()

  const pdfBuffer = await PDFGeneratorService.generatePDF(cvContent)

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="cv.pdf"'
    }
  })
}
```

---

### Phase 3 : Analytics & A/B Testing (1-2 semaines)

#### 3.1 Dashboard de suivi

**Fichier à créer** : `app/dashboard/analytics/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { ABTestResult } from '@/lib/types'

export default function AnalyticsPage() {
  const [results, setResults] = useState<ABTestResult[]>([])

  useEffect(() => {
    // Fetch depuis Supabase
    supabase
      .from('ab_test_results')
      .select('*')
      .then(({ data }) => setResults(data))
  }, [])

  return (
    <div>
      <h1>Analytics A/B Testing</h1>

      <div className="grid grid-cols-3 gap-4">
        {results.map(result => (
          <div key={result.variant} className="card">
            <h3>{result.variant}</h3>
            <p>Candidatures: {result.totalApplications}</p>
            <p>Taux de réponse: {result.responseRate}%</p>
            <p>Délai moyen: {result.avgDaysToResponse} jours</p>
          </div>
        ))}
      </div>

      {/* Graphique avec Recharts */}
      <BarChart data={results} />
    </div>
  )
}
```

#### 3.2 Formulaire de tracking

**Fichier à créer** : `components/forms/ApplicationForm.tsx`

```typescript
export function ApplicationForm({ cvVariant }: { cvVariant: string }) {
  async function trackApplication(data) {
    await supabase
      .from('applications')
      .insert({
        user_profile_id: userId,
        job_title: data.jobTitle,
        company: data.company,
        cv_variant: cvVariant,
        channel: data.channel,
        applied_date: new Date().toISOString()
      })
  }

  return (
    <form onSubmit={handleSubmit(trackApplication)}>
      <input name="jobTitle" placeholder="Titre du poste" />
      <input name="company" placeholder="Entreprise" />
      <select name="channel">
        <option value="linkedin">LinkedIn</option>
        <option value="direct_email">Email direct</option>
        <option value="company_website">Site entreprise</option>
      </select>
      <button type="submit">Enregistrer</button>
    </form>
  )
}
```

---

## 🎨 Design System

### Installation Shadcn/ui

```bash
npx shadcn@latest init

# Ajouter les composants nécessaires
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add badge
npx shadcn@latest add progress
npx shadcn@latest add alert
```

### Palette de couleurs recommandée

```css
/* tailwind.config.ts */
{
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',    // Bleu professionnel
        success: '#10B981',    // Vert (score ATS OK)
        warning: '#F59E0B',    // Orange (zone jaune)
        danger: '#EF4444',     // Rouge (zone rouge)
        neutral: '#6B7280'     // Gris
      }
    }
  }
}
```

---

## 🧪 Testing

### Tests à écrire en priorité

```bash
# Installation
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Tester les services
__tests__/
  services/
    claude.service.test.ts
    job-analyzer.service.test.ts
    cv-generator.service.test.ts
```

**Exemple de test** :

```typescript
import { describe, it, expect } from 'vitest'
import { JobAnalyzerService } from '@/lib/services/job-analyzer.service'

describe('JobAnalyzerService', () => {
  it('should extract technical keywords', async () => {
    const jobText = 'Nous cherchons un dev React Native avec TypeScript...'

    const analysis = await JobAnalyzerService.analyzeJob(jobText)

    expect(analysis.keywords.technical).toContain('React Native')
    expect(analysis.keywords.technical).toContain('TypeScript')
  })
})
```

---

## 📦 Déploiement

### Checklist avant déploiement

- [ ] Toutes les variables d'environnement configurées dans Vercel
- [ ] Schéma Supabase exécuté en production
- [ ] Tests passent (`npm run test`)
- [ ] Build réussit (`npm run build`)
- [ ] Pas d'erreurs ESLint (`npm run lint`)

### Commandes

```bash
# Build local
npm run build

# Déployer sur Vercel
vercel --prod

# Vérifier les logs
vercel logs <deployment-url>
```

---

## 🐛 Debugging Tips

### Claude API errors

```typescript
// Ajouter des logs détaillés
console.log('Prompt envoyé à Claude:', prompt)
console.log('Réponse Claude:', response)

// Vérifier le format JSON
try {
  const parsed = JSON.parse(response)
} catch (e) {
  console.error('Invalid JSON from Claude:', response)
}
```

### Supabase RLS issues

```sql
-- Désactiver temporairement RLS pour debug
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

---

## 📚 Ressources Utiles

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Claude API Docs](https://docs.anthropic.com/)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎯 Objectifs par Sprint

### Sprint 1 (Semaine 1-2)
- [ ] Page d'accueil + layout
- [ ] Formulaire de profil complet
- [ ] Sauvegarde/récupération dans Supabase

### Sprint 2 (Semaine 3-4)
- [ ] Interface analyse d'offre
- [ ] Interface génération CV
- [ ] Preview CV

### Sprint 3 (Semaine 5-6)
- [ ] Export PDF/DOCX
- [ ] Tracking des candidatures
- [ ] Dashboard analytics de base

### Sprint 4 (Semaine 7-8)
- [ ] Lettres de motivation
- [ ] Détecteur ghost jobs
- [ ] Polish UI/UX

---

**Tu as toute l'architecture backend. Maintenant, c'est à toi de coder le frontend ! 💪**

Si tu as des questions sur l'implémentation, reviens vers moi avec le fichier/fonction spécifique.

Bon code ! 🚀
