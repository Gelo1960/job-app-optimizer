/**
 * PROMPT SYSTÈME: Enrichissement d'entreprise
 * Utilisé pour analyser et structurer les informations sur une entreprise
 */

export const COMPANY_ENRICHMENT_SYSTEM_PROMPT = `Tu es un expert en recherche d'entreprise et veille économique.
Ta mission est d'analyser les informations disponibles sur une entreprise et d'en extraire les éléments les plus pertinents pour un candidat.

Tu dois identifier:
- Les réalisations récentes et actualités marquantes
- Les pain points et défis potentiels de l'entreprise
- La culture d'entreprise et les valeurs
- Les produits ou services phares

Sois factuel et basé sur les données fournies. Ne spécule pas.`;

export const createCompanyEnrichmentPrompt = (
  companyName: string,
  scrapedData: string
) => `
Analyse les informations suivantes sur l'entreprise "${companyName}" et extrait les données pertinentes.

DONNÉES COLLECTÉES:
${scrapedData}

EXTRAIT en JSON avec cette structure EXACTE:

{
  "companyName": "${companyName}",
  "website": "url du site web si trouvé",
  "linkedinUrl": "url LinkedIn si trouvé",
  "recentAchievements": [
    "réalisation ou succès récent (funding, croissance, lancement produit, etc.)"
  ],
  "painPoints": [
    "défis ou problèmes que l'entreprise cherche à résoudre"
  ],
  "cultureKeywords": [
    "mots-clés décrivant la culture (innovation, collaboration, etc.)"
  ],
  "notableProducts": [
    "produits ou services principaux"
  ],
  "recentNews": [
    {
      "title": "titre de l'actualité",
      "date": "2024-01-15",
      "source": "nom de la source"
    }
  ],
  "employeeCount": 150,
  "funding": "Series B - 50M EUR"
}

INSTRUCTIONS CRITIQUES:
1. Utilise UNIQUEMENT les informations présentes dans les données fournies
2. Si une information n'est pas disponible, utilise null ou un tableau vide
3. Pour "recentAchievements": Focus sur les 6 derniers mois maximum
4. Pour "painPoints": Déduis depuis les offres d'emploi, communiqués, ou mentions de défis
5. Pour "cultureKeywords": Extrait depuis les pages "About", "Careers", ou descriptions
6. Limite à 3-5 éléments par tableau pour rester concis
7. Pour les dates: Format ISO (YYYY-MM-DD)

Retourne UNIQUEMENT le JSON, sans texte avant ou après.
`;

export const createSimpleWebScrapingPrompt = (companyName: string) => `
Retourne en JSON la structure suivante avec des valeurs par défaut basées uniquement sur le nom de l'entreprise "${companyName}":

{
  "companyName": "${companyName}",
  "website": null,
  "linkedinUrl": null,
  "recentAchievements": [],
  "painPoints": ["En cours de recrutement pour renforcer les équipes"],
  "cultureKeywords": ["Innovation", "Collaboration"],
  "notableProducts": [],
  "recentNews": [],
  "employeeCount": null,
  "funding": null
}

Retourne UNIQUEMENT le JSON, sans texte avant ou après.
`;
