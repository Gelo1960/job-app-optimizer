import {
  UserProfile,
  JobAnalysis,
  CoverLetterContent,
} from '../types';
import { ClaudeService } from './claude.service';
import {
  COVER_LETTER_GENERATION_SYSTEM_PROMPT,
  createCoverLetterPrompt,
} from '../prompts/cover-letter-generation.prompt';

/**
 * Interface pour la réponse de génération de lettre de motivation
 */
export interface CoverLetter {
  greeting: string;
  introduction: string;
  body: {
    credibility: string;
    uniqueValue: string;
    culturalFit: string;
  };
  closing: string;
  signature: string;
}

/**
 * Score de qualité de la lettre de motivation
 */
export interface CoverLetterScore {
  overallScore: number; // 0-100
  breakdown: {
    length: number; // Respect de la longueur cible (300-400 mots)
    hookQuality: number; // Qualité du hook (pas de clichés)
    personalization: number; // Niveau de personnalisation
    keywordIntegration: number; // Intégration naturelle des mots-clés
    callToAction: number; // Clarté et force du CTA
  };
  recommendation: string;
}

/**
 * Service de génération de lettres de motivation optimisées
 */
export class CoverLetterGeneratorService {
  /**
   * Génère une lettre de motivation personnalisée
   */
  static async generateCoverLetter(
    profile: UserProfile,
    jobAnalysis: JobAnalysis,
    optimizationLevel: 'safe' | 'optimized' | 'maximized' = 'optimized'
  ): Promise<CoverLetter> {
    console.log(
      `→ Generating cover letter (level: ${optimizationLevel})...`
    );

    // Génère le contenu de la lettre
    const prompt = createCoverLetterPrompt(
      profile,
      jobAnalysis,
      optimizationLevel
    );

    const coverLetter = await ClaudeService.sendPromptJSON<CoverLetter>(
      prompt,
      COVER_LETTER_GENERATION_SYSTEM_PROMPT
    );

    return coverLetter;
  }

  /**
   * Calcule un score de qualité pour la lettre de motivation
   */
  static calculateCoverLetterScore(
    coverLetter: CoverLetter,
    jobAnalysis: JobAnalysis
  ): CoverLetterScore {
    // 1. Longueur (cible: 300-400 mots)
    const fullText = this.convertCoverLetterToText(coverLetter);
    const wordCount = fullText.split(/\s+/).length;
    let lengthScore = 100;
    if (wordCount < 250 || wordCount > 450) lengthScore = 60;
    else if (wordCount < 280 || wordCount > 420) lengthScore = 80;

    // 2. Hook quality (détecte les clichés)
    const badHooks = [
      'je vous écris',
      'je me permets',
      'suite à votre annonce',
      'je suis vivement intéressé',
      'c\'est avec grand intérêt',
    ];
    const intro = coverLetter.introduction.toLowerCase();
    const hasBadHook = badHooks.some((bad) => intro.includes(bad));
    const hookQuality = hasBadHook ? 30 : 100;

    // 3. Personnalisation (cherche des éléments génériques)
    const genericPhrases = [
      'entreprise innovante',
      'équipe dynamique',
      'belle opportunité',
      'challenge passionnant',
      'rejoindre votre équipe',
    ];
    const bodyText =
      coverLetter.body.credibility +
      coverLetter.body.uniqueValue +
      coverLetter.body.culturalFit;
    const genericCount = genericPhrases.filter((phrase) =>
      bodyText.toLowerCase().includes(phrase)
    ).length;
    const personalization = Math.max(40, 100 - genericCount * 20);

    // 4. Intégration des mots-clés
    const allKeywords = [
      ...jobAnalysis.keywords.technical,
      ...jobAnalysis.keywords.business,
    ].slice(0, 10); // Top 10 mots-clés
    const fullTextLower = fullText.toLowerCase();
    const matchedKeywords = allKeywords.filter((keyword) =>
      fullTextLower.includes(keyword.toLowerCase())
    );
    const keywordIntegration = Math.round(
      (matchedKeywords.length / allKeywords.length) * 100
    );

    // 5. Call to action (vérifie qu'il est concret)
    const weakCTA = [
      'j\'attends votre retour',
      'en attente de votre réponse',
      'dans l\'attente',
      'restant à votre disposition',
    ];
    const closing = coverLetter.closing.toLowerCase();
    const hasWeakCTA = weakCTA.some((weak) => closing.includes(weak));
    const callToAction = hasWeakCTA ? 50 : 100;

    // Score global
    const overallScore = Math.round(
      lengthScore * 0.15 +
        hookQuality * 0.25 + // Le plus important !
        personalization * 0.25 +
        keywordIntegration * 0.2 +
        callToAction * 0.15
    );

    // Recommandation
    let recommendation = '';
    if (overallScore >= 85) {
      recommendation = 'Excellente lettre ! Prête à envoyer.';
    } else if (overallScore >= 70) {
      recommendation =
        'Bonne lettre. Vérifiez la personnalisation et les mots-clés.';
    } else {
      recommendation =
        'À améliorer. Focus sur le hook et la personnalisation.';
    }

    if (hasBadHook) {
      recommendation +=
        ' ATTENTION: Hook générique détecté. Reformulez l\'introduction.';
    }

    return {
      overallScore,
      breakdown: {
        length: lengthScore,
        hookQuality,
        personalization,
        keywordIntegration,
        callToAction,
      },
      recommendation,
    };
  }

  /**
   * Convertit la lettre de motivation en texte brut (pour export ou preview)
   */
  static convertCoverLetterToText(coverLetter: CoverLetter): string {
    let text = '';

    // Greeting
    text += `${coverLetter.greeting}\n\n`;

    // Introduction
    text += `${coverLetter.introduction}\n\n`;

    // Body
    text += `${coverLetter.body.credibility}\n\n`;
    text += `${coverLetter.body.uniqueValue}\n\n`;
    text += `${coverLetter.body.culturalFit}\n\n`;

    // Closing
    text += `${coverLetter.closing}\n\n`;

    // Signature
    text += `${coverLetter.signature}`;

    return text;
  }

  /**
   * Convertit la lettre de motivation en HTML (pour export PDF ou email)
   */
  static convertCoverLetterToHTML(coverLetter: CoverLetter): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 650px;
      margin: 40px auto;
      padding: 20px;
    }
    .greeting {
      margin-bottom: 20px;
    }
    .paragraph {
      margin-bottom: 16px;
      text-align: justify;
    }
    .signature {
      margin-top: 30px;
      white-space: pre-line;
    }
  </style>
</head>
<body>
  <div class="greeting">${coverLetter.greeting}</div>

  <div class="paragraph">${coverLetter.introduction}</div>

  <div class="paragraph">${coverLetter.body.credibility}</div>

  <div class="paragraph">${coverLetter.body.uniqueValue}</div>

  <div class="paragraph">${coverLetter.body.culturalFit}</div>

  <div class="paragraph">${coverLetter.closing}</div>

  <div class="signature">${coverLetter.signature}</div>
</body>
</html>
    `.trim();
  }

  /**
   * Génère plusieurs variantes de lettres avec différents niveaux d'optimisation
   */
  static async generateVariants(
    profile: UserProfile,
    jobAnalysis: JobAnalysis
  ): Promise<{
    safe: CoverLetter;
    optimized: CoverLetter;
    maximized: CoverLetter;
  }> {
    console.log('→ Generating cover letter variants...');

    const [safe, optimized, maximized] = await Promise.all([
      this.generateCoverLetter(profile, jobAnalysis, 'safe'),
      this.generateCoverLetter(profile, jobAnalysis, 'optimized'),
      this.generateCoverLetter(profile, jobAnalysis, 'maximized'),
    ]);

    return { safe, optimized, maximized };
  }
}
