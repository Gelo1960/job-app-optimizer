import { UserProfile, JobAnalysis, CVContent } from '../types';

/**
 * PROMPT SYSTÈME: Génération de CV optimisé ATS
 */

export const CV_GENERATION_SYSTEM_PROMPT = `Tu es un rédacteur de CV expert en optimisation ATS (Applicant Tracking Systems).

Tu comprends parfaitement:
- Comment les ATS parsent et scorent les CVs
- L'importance des mots-clés EXACTS (pas de synonymes)
- La psychologie cognitive des recruteurs (F-pattern, biais)
- L'équilibre entre optimisation et authenticité

Tu NE DOIS JAMAIS:
- Inventer des expériences ou compétences
- Mentir sur des dates ou titres
- Créer du "keyword stuffing" détectable

Tu DOIS TOUJOURS:
- Reformuler les vraies expériences du candidat de façon optimisée
- Utiliser les mots-clés exacts de l'offre d'emploi
- Quantifier les réalisations quand possible
- Maintenir un ton professionnel et crédible`;

export const createCVGenerationPrompt = (
  profile: UserProfile,
  jobAnalysis: JobAnalysis,
  variant: keyof UserProfile['profileVariants'],
  optimizationLevel: 'safe' | 'optimized' | 'maximized'
) => {
  const selectedVariant = profile.profileVariants[variant];

  return `
GÉNÈRE un CV optimisé pour cette offre d'emploi.

=== PROFIL DU CANDIDAT ===
${JSON.stringify(profile, null, 2)}

=== VARIANTE SÉLECTIONNÉE ===
${JSON.stringify(selectedVariant, null, 2)}

=== ANALYSE DE L'OFFRE ===
${JSON.stringify(jobAnalysis, null, 2)}

=== NIVEAU D'OPTIMISATION ===
${optimizationLevel}
${optimizationLevel === 'safe' ? '→ Factuel strict, zéro embellissement' : ''}
${optimizationLevel === 'optimized' ? '→ Reformulation professionnelle, embellissement mesuré' : ''}
${optimizationLevel === 'maximized' ? '→ Maximisation des impacts, limite de la zone verte' : ''}

=== CONTRAINTES STRICTES ===

1. MOTS-CLÉS:
   - Utilise les formulations EXACTES de l'offre (pas de synonymes!)
   - Intègre naturellement dans les bullet points
   - Densité cible: 2-3% par mot-clé (au-delà = spam)
   - Priorité aux mots-clés techniques > business > tools

2. FORMAT BULLET POINTS:
   - 3-4 bullets max par expérience
   - Longueur: 15-25 mots par bullet
   - Structure: [Verbe d'action fort] + [Quoi] + [Résultat chiffré si possible]
   - Commence par: Développé, Conçu, Lancé, Optimisé, Dirigé, Implémenté (jamais "Participé à", "Aidé à")

3. QUANTIFICATION:
   - 80% des bullets doivent contenir un chiffre/métrique
   - Si pas de métrique exacte, utilise des estimations crédibles ("~X", "environ X")
   - Ex: "~500 lignes de code", "amélioration estimée de 20%"

4. TON ET STYLE:
   - Formel si formalityScore > 7
   - Professionnel standard si 4-7
   - Direct/concret si < 4
   - Jamais de jargon corporate creux ("synergies", "value-add")

5. HIÉRARCHIE (F-PATTERN):
   - Les 3 premières lignes du CV = critical (lu à 100%)
   - Ordre des sections selon selectedVariant.sectionsOrder
   - Les expériences/projets les plus pertinents en PREMIER (pas chronologique!)

6. PROJETS PERSONNELS:
   - Si projets impressionnants (apps live, etc.), les mettre AVANT l'expérience pro classique
   - Focus sur les KPIs techniques ET business

=== FORMAT DE SORTIE ===

Retourne un JSON avec cette structure:

{
  "header": {
    "name": "Prénom Nom",
    "title": "Titre professionnel ciblé (basé sur l'offre)",
    "contact": ["email", "téléphone", "ville", "LinkedIn", "GitHub", "Portfolio"]
  },
  "professionalSummary": "2-3 phrases percutantes qui intègrent les keywords principaux et le profil unique du candidat",
  "skills": [
    {
      "category": "Langages & Frameworks",
      "items": ["React Native", "TypeScript", "..."] // Ordre: mots-clés de l'offre en premier
    },
    {
      "category": "Outils & Technologies",
      "items": ["Git", "Docker", "..."]
    }
  ],
  "experience": [
    {
      "title": "Développeur Full-Stack Mobile",
      "company": "Projets Personnels",
      "period": "2023 - Présent",
      "bullets": [
        "Développé 3 applications mobiles React Native avec +10K téléchargements cumulés sur l'App Store",
        "...",
      ]
    }
  ],
  "projects": [ // Optionnel, si variant l'inclut
    {
      "name": "Summer Dating",
      "description": "Application de rencontres iOS (React Native)",
      "tech": ["React Native", "Firebase", "Redux"],
      "highlights": [
        "Publié sur l'App Store avec résolution des problématiques iPad compatibility",
        "Architecture scalable avec gestion d'état Redux"
      ]
    }
  ],
  "education": [
    {
      "degree": "Master",
      "institution": "Nom institution",
      "period": "2020 - 2022"
    }
  ],
  "additional": [ // Optionnel
    {
      "section": "Langues",
      "content": "Français (natif), Anglais (courant - C1)"
    }
  ]
}

GÉNÈRE 3 VERSIONS:
1. "safe": Factuel pur
2. "optimized": Version recommandée (équilibre)
3. "maximized": Limite haute (optionnel si demandé)

Retourne UNIQUEMENT le JSON pour la version "${optimizationLevel}".
`;
};
