/**
 * ⚠️ WARNING: This service uses Claude API and should ONLY be imported in API routes (server-side).
 * DO NOT import this in Client Components or pages - it will expose your API keys!
 * 
 * For client-side formatting utilities, use @/lib/utils/cv-formatter instead.
 */

import {
  UserProfile,
  JobAnalysis,
  CVGenerationResult,
  CVContent,
  ATSScore,
  RiskAssessment,
  RiskLevel,
} from '../types';
import { ClaudeService } from './claude.service';
import {
  CV_GENERATION_SYSTEM_PROMPT,
  createCVGenerationPrompt,
} from '../prompts/cv-generation.prompt';

/**
 * Service de génération de CV optimisé
 */
export class CVGeneratorService {
  /**
   * Génère un CV optimisé pour une offre d'emploi
   */
  static async generateCV(
    profile: UserProfile,
    jobAnalysis: JobAnalysis,
    variant: keyof UserProfile['profileVariants'],
    optimizationLevel: 'safe' | 'optimized' | 'maximized' = 'optimized'
  ): Promise<CVGenerationResult> {
    console.log(
      `→ Generating CV (variant: ${variant}, level: ${optimizationLevel})...`
    );

    // Génère le contenu du CV
    const prompt = createCVGenerationPrompt(
      profile,
      jobAnalysis,
      variant,
      optimizationLevel
    );

    const content = await ClaudeService.sendPromptJSON<CVContent>(
      prompt,
      CV_GENERATION_SYSTEM_PROMPT
    );

    // Calcule le score ATS simulé
    const atsScore = this.calculateATSScore(content, jobAnalysis);

    // Évalue les risques
    const riskAssessment = this.assessRisks(content, profile);

    // Génère les variantes (safe et optimized)
    const variants = await this.generateVariants(
      profile,
      jobAnalysis,
      variant,
      optimizationLevel
    );

    return {
      content,
      atsScore,
      riskAssessment,
      variants,
    };
  }

  /**
   * Calcule un score ATS simulé
   * Mimique la logique de scoring d'un vrai ATS
   */
  private static calculateATSScore(
    cv: CVContent,
    jobAnalysis: JobAnalysis
  ): ATSScore {
    // 1. Format parsable (toujours 100 pour nos CVs bien structurés)
    const formatParsable = 100;

    // 2. Keyword match
    const cvText = JSON.stringify(cv).toLowerCase();
    const allKeywords = [
      ...jobAnalysis.keywords.technical,
      ...jobAnalysis.keywords.business,
      ...jobAnalysis.keywords.tools,
    ];

    const matchedKeywords = allKeywords.filter((keyword) =>
      cvText.includes(keyword.toLowerCase())
    );
    const keywordMatch = (matchedKeywords.length / allKeywords.length) * 100;

    // 3. Structure standard (vérifier présence des sections attendues)
    const requiredSections = [
      'header',
      'professionalSummary',
      'skills',
      'experience',
    ];
    const hasAllSections = requiredSections.every((section) => cv[section as keyof CVContent]);
    const structureStandard = hasAllSections ? 100 : 70;

    // 4. Format des dates (simple check)
    const dateFormat = 100; // On assume que nos dates sont bien formatées

    // 5. Cohérence chronologique
    const chronologyConsistent = this.checkChronology(cv) ? 100 : 60;

    // Score global (moyenne pondérée)
    const overallScore = Math.round(
      formatParsable * 0.15 +
      keywordMatch * 0.4 + // Le plus important!
      structureStandard * 0.2 +
      dateFormat * 0.1 +
      chronologyConsistent * 0.15
    );

    return {
      overallScore,
      breakdown: {
        formatParsable,
        keywordMatch: Math.round(keywordMatch),
        structureStandard,
        dateFormat,
        chronologyConsistent,
      },
      passThreshold: 70,
      willPass: overallScore >= 70,
    };
  }

  /**
   * Vérifie la cohérence chronologique des expériences
   */
  private static checkChronology(cv: CVContent): boolean {
    // Simple check: les périodes ne se chevauchent pas bizarrement
    // TODO: Implémenter une vraie logique de détection de gaps/overlaps
    return true;
  }

  /**
   * Évalue les risques du CV généré
   */
  private static assessRisks(
    cv: CVContent,
    profile: UserProfile
  ): RiskAssessment {
    const flags: RiskAssessment['flags'] = [];

    // Vérifie si des titres ont été normalisés
    cv.experience.forEach((exp) => {
      const originalExp = profile.experiences.find((e) =>
        exp.company.includes(e.company)
      );

      if (originalExp && exp.title !== originalExp.title) {
        flags.push({
          statement: `Titre "${exp.title}" (original: "${originalExp.title}")`,
          riskLevel: originalExp.riskLevel || 'LOW',
          reason: 'Normalisation du titre de poste',
          recommendation:
            'Préparer une explication si questionné en entretien',
        });
      }
    });

    // Détecte les affirmations fortes sans métriques
    cv.experience.forEach((exp) => {
      exp.bullets.forEach((bullet) => {
        const hasNumber = /\d+/.test(bullet);
        const hasStrongClaim =
          /augmenté|optimisé|amélioré|réduit|accéléré/i.test(bullet);

        if (hasStrongClaim && !hasNumber) {
          flags.push({
            statement: bullet,
            riskLevel: 'MEDIUM',
            reason: 'Affirmation forte sans quantification',
            recommendation: 'Préparer des exemples concrets si demandé',
          });
        }
      });
    });

    // Calcule le risque global
    const riskCounts = {
      LOW: flags.filter((f) => f.riskLevel === 'LOW').length,
      MEDIUM: flags.filter((f) => f.riskLevel === 'MEDIUM').length,
      HIGH: flags.filter((f) => f.riskLevel === 'HIGH').length,
    };

    let overallRisk: RiskLevel = 'LOW';
    if (riskCounts.HIGH > 0) overallRisk = 'HIGH';
    else if (riskCounts.MEDIUM > 2) overallRisk = 'MEDIUM';

    return {
      overallRisk,
      flags,
    };
  }

  /**
   * Génère les 3 variantes (safe, optimized, maximized)
   */
  private static async generateVariants(
    profile: UserProfile,
    jobAnalysis: JobAnalysis,
    variant: keyof UserProfile['profileVariants'],
    currentLevel: 'safe' | 'optimized' | 'maximized'
  ): Promise<{
    safe: CVContent;
    optimized: CVContent;
    maximized?: CVContent;
  }> {
    // Si on a déjà généré "optimized", pas besoin de régénérer toutes les variantes
    // Pour le MVP, on retourne juste la version actuelle
    // TODO: Implémenter la vraie génération des 3 versions en parallèle

    const levels: Array<'safe' | 'optimized' | 'maximized'> = [
      'safe',
      'optimized',
    ];
    const variants: any = {};

    for (const level of levels) {
      if (level === currentLevel) {
        // On réutilise la version déjà générée
        continue;
      }

      const prompt = createCVGenerationPrompt(
        profile,
        jobAnalysis,
        variant,
        level
      );
      variants[level] = await ClaudeService.sendPromptJSON<CVContent>(
        prompt,
        CV_GENERATION_SYSTEM_PROMPT
      );
    }

    return {
      safe: variants.safe || ({} as CVContent),
      optimized: variants.optimized || ({} as CVContent),
    };
  }

  /**
   * Convertit le CVContent en texte brut (pour preview ou export texte)
   */
  static cvContentToText(cv: CVContent): string {
    let text = '';

    // Header
    text += `${cv.header.name}\n`;
    text += `${cv.header.title}\n`;
    text += `${cv.header.contact.join(' | ')}\n\n`;

    // Professional Summary
    text += `PROFIL PROFESSIONNEL\n`;
    text += `${cv.professionalSummary}\n\n`;

    // Skills
    text += `COMPÉTENCES\n`;
    cv.skills.forEach((skillGroup) => {
      text += `${skillGroup.category}: ${skillGroup.items.join(', ')}\n`;
    });
    text += `\n`;

    // Experience
    text += `EXPÉRIENCE PROFESSIONNELLE\n`;
    cv.experience.forEach((exp) => {
      text += `${exp.title} - ${exp.company} (${exp.period})\n`;
      exp.bullets.forEach((bullet) => {
        text += `• ${bullet}\n`;
      });
      text += `\n`;
    });

    // Projects (if any)
    if (cv.projects && cv.projects.length > 0) {
      text += `PROJETS\n`;
      cv.projects.forEach((project) => {
        text += `${project.name}\n`;
        text += `${project.description}\n`;
        text += `Technologies: ${project.tech.join(', ')}\n`;
        project.highlights.forEach((highlight) => {
          text += `• ${highlight}\n`;
        });
        text += `\n`;
      });
    }

    // Education
    text += `FORMATION\n`;
    cv.education.forEach((edu) => {
      text += `${edu.degree} - ${edu.institution} (${edu.period})\n`;
    });

    // Additional
    if (cv.additional) {
      cv.additional.forEach((section) => {
        text += `\n${section.section}\n`;
        text += `${section.content}\n`;
      });
    }

    return text;
  }
}
