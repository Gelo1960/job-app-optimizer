import { UserProfile, JobAnalysis } from '../types';

/**
 * PROMPT SYSTÈME: Génération de lettres de motivation optimisées
 */

export const COVER_LETTER_GENERATION_SYSTEM_PROMPT = `Tu es un expert en rédaction de lettres de motivation professionnelles.

Tu comprends parfaitement:
- La psychologie des recruteurs et hiring managers
- L'importance de personnaliser chaque lettre selon l'entreprise
- L'équilibre entre démontrer son intérêt et prouver sa valeur
- Les techniques de storytelling pour capter l'attention

Tu NE DOIS JAMAIS:
- Utiliser des formules génériques ou clichés ("Je me permets de vous contacter")
- Répéter simplement ce qui est dans le CV
- Inventer des expériences ou compétences
- Être trop long (max 350-400 mots)

Tu DOIS TOUJOURS:
- Commencer par un hook captivant (pas de "Je vous écris pour...")
- Démontrer une vraie recherche sur l'entreprise
- Connecter les besoins de l'entreprise aux compétences du candidat
- Utiliser des exemples concrets et chiffrés
- Terminer par un appel à l'action clair
- Adapter le ton au niveau de formalité détecté

STRUCTURE OPTIMALE:
1. Hook (1-2 phrases): Capter l'attention, montrer qu'on comprend un pain point
2. Crédibilité (1 paragraphe): Prouver qu'on peut résoudre ce problème avec exemples concrets
3. Valeur unique (1 paragraphe): Ce qui nous différencie (profil hybride, projets perso, etc.)
4. Fit culturel (1 paragraphe): Pourquoi cette entreprise précisément
5. Appel à l'action (1-2 phrases): Proposition concrète de prochaine étape`;

export const createCoverLetterPrompt = (
  profile: UserProfile,
  jobAnalysis: JobAnalysis,
  optimizationLevel: 'safe' | 'optimized' | 'maximized'
) => {
  return `
GÉNÈRE une lettre de motivation personnalisée pour cette candidature.

=== PROFIL DU CANDIDAT ===
Nom: ${profile.firstName} ${profile.lastName}
Email: ${profile.email}
Téléphone: ${profile.phone}
Localisation: ${profile.location}
LinkedIn: ${profile.linkedinUrl || 'N/A'}
GitHub: ${profile.githubUrl || 'N/A'}
Portfolio: ${profile.portfolioUrl || 'N/A'}

Rôle cible: ${profile.targetRole}

Expériences:
${JSON.stringify(profile.experiences, null, 2)}

Projets:
${JSON.stringify(profile.projects, null, 2)}

Formation:
${JSON.stringify(profile.education, null, 2)}

Compétences:
${JSON.stringify(profile.skills, null, 2)}

=== ANALYSE DE L'OFFRE ===
${JSON.stringify(jobAnalysis, null, 2)}

=== NIVEAU D'OPTIMISATION ===
${optimizationLevel}
${optimizationLevel === 'safe' ? '→ Ton factuel et sobre, pas de superlatifs' : ''}
${optimizationLevel === 'optimized' ? '→ Ton professionnel et engageant, équilibre persuasion/authenticité' : ''}
${optimizationLevel === 'maximized' ? '→ Ton très persuasif, storytelling fort, maximise l\'impact' : ''}

=== NIVEAU DE FORMALITÉ À RESPECTER ===
Score de formalité détecté: ${jobAnalysis.formalityScore}/10
${jobAnalysis.formalityScore > 7 ? '→ Ton TRÈS formel: vouvoiement, phrases longues, registre soutenu' : ''}
${jobAnalysis.formalityScore >= 4 && jobAnalysis.formalityScore <= 7 ? '→ Ton professionnel standard: vouvoiement, phrases modérées, registre courant' : ''}
${jobAnalysis.formalityScore < 4 ? '→ Ton direct et moderne: tutoiement possible, phrases courtes, registre familier-professionnel' : ''}

Type d'entreprise: ${jobAnalysis.companyType}
${jobAnalysis.companyType === 'startup' ? '→ Mettre en avant: agilité, polyvalence, impact rapide, projets perso' : ''}
${jobAnalysis.companyType === 'scaleup' ? '→ Mettre en avant: scalabilité, croissance, process, leadership' : ''}
${jobAnalysis.companyType === 'corporate' ? '→ Mettre en avant: rigueur, conformité, team fit, long terme' : ''}
${jobAnalysis.companyType === 'agency' ? '→ Mettre en avant: multi-clients, rapidité, créativité, adaptabilité' : ''}

=== CONTRAINTES STRICTES ===

1. LONGUEUR:
   - Total: 300-400 mots maximum
   - Hook: 20-40 mots
   - Crédibilité: 80-100 mots
   - Valeur unique: 60-80 mots
   - Fit culturel: 60-80 mots
   - CTA: 20-30 mots

2. HOOK (CRITICAL - Détermine si la lettre sera lue):
   - NE JAMAIS commencer par: "Je vous écris pour...", "Suite à votre annonce...", "Je me permets..."
   - TOUJOURS commencer par: un insight sur l'entreprise, une question provocante, une stat pertinente, ou un pain point identifié
   - Exemples de bons hooks:
     * "Scaler une application mobile de 1K à 100K utilisateurs en 6 mois, c'est exactement le challenge que j'ai relevé avec Summer Dating — et c'est précisément ce que [Entreprise] cherche pour sa phase de croissance."
     * "Développer en solo une app de A à Z n'est pas courant. Mais c'est exactement cette autonomie et polyvalence qui manquent souvent aux équipes React Native."
     * "${jobAnalysis.problemsToSolve[0]} — c'est le défi mentionné dans votre offre. C'est aussi exactement ce que j'ai résolu chez [ancienne entreprise/projet]."

3. CRÉDIBILITÉ (Preuves concrètes):
   - 2-3 exemples CHIFFRÉS qui prouvent qu'on peut résoudre les pain points
   - Utiliser les projets personnels s'ils sont impressionnants (app live = très fort)
   - Format: "J'ai [action concrète] qui a permis [résultat chiffré]"
   - Intégrer naturellement les mots-clés techniques de l'offre

4. VALEUR UNIQUE (Différenciation):
   - Mettre en avant le profil hybride/atypique si applicable
   - Exemples:
     * Profil tech + business (formation marketing + dev)
     * Side projects impressionnants (apps publiées)
     * Compétences rares pour le niveau (junior avec app live)
   - Expliquer POURQUOI c'est un atout pour CETTE entreprise précisément

5. FIT CULTUREL:
   - Montrer qu'on a VRAIMENT recherché l'entreprise
   - Mentionner un élément spécifique: produit, mission, actualité récente, tech stack
   - Connecter nos valeurs/intérêts aux leurs
   - Éviter les généralités ("entreprise innovante", "équipe dynamique")

6. APPEL À L'ACTION:
   - Proposer quelque chose de concret (pas juste "j'attends votre retour")
   - Exemples:
     * "Je serais ravi d'échanger 15 minutes sur [sujet précis]"
     * "Je peux vous montrer en détail comment j'ai [résolu X]"
     * "Disponible pour un coffee chat cette semaine si vous souhaitez discuter de [Y]"

7. SIGNATURE:
   - Formule de politesse adaptée au niveau de formalité
   - Nom complet
   - Coordonnées (email, téléphone)

=== FORMAT DE SORTIE ===

Retourne un JSON avec cette structure:

{
  "greeting": "Madame, Monsieur," // ou "Bonjour [Prénom]," si contexte moins formel et si nom connu
  "introduction": "Le hook captivant (1-2 phrases qui donnent envie de lire la suite)",
  "body": {
    "credibility": "Paragraphe de crédibilité avec exemples concrets et chiffrés",
    "uniqueValue": "Paragraphe sur la valeur unique et le profil différenciant",
    "culturalFit": "Paragraphe sur le fit avec l'entreprise et pourquoi cette opportunité"
  },
  "closing": "Appel à l'action et formule de politesse",
  "signature": "Cordialement,\\n${profile.firstName} ${profile.lastName}\\n${profile.email}\\n${profile.phone}"
}

IMPORTANT:
- Retourne UNIQUEMENT le JSON, sans markdown ni commentaires
- Assure-toi que le texte soit fluide et naturel, pas robotique
- Vérifie que la lettre complète fasse 300-400 mots
- Adapte le ton selon le niveau de formalité (${jobAnalysis.formalityScore}/10)
- Intègre naturellement les mots-clés techniques: ${jobAnalysis.keywords.technical.slice(0, 5).join(', ')}
`;
};
