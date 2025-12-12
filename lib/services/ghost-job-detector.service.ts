import {
  JobAnalysis,
  CompanyEnrichment,
  GhostJobDetection,
  GhostJobSignal,
  GhostJobRiskLevel,
} from '../types';
import { supabase } from '../db/supabase';
import crypto from 'crypto';

/**
 * Service de détection de "ghost jobs" (fausses offres d'emploi)
 * Analyse les signaux suspects dans les offres d'emploi
 */
export class GhostJobDetectorService {
  /**
   * Détecte si une offre d'emploi est potentiellement un "ghost job"
   * Retourne un score de 0-100 (plus c'est haut, plus c'est suspect)
   */
  static async detectGhostJob(
    jobAnalysis: JobAnalysis,
    companyData?: CompanyEnrichment,
    jobUrl?: string
  ): Promise<GhostJobDetection> {
    const signals: GhostJobSignal[] = [];
    let totalScore = 0;

    // 1. Analyse de la description (vagueness)
    const vagueSignals = this.detectVagueness(jobAnalysis);
    signals.push(...vagueSignals);
    totalScore += vagueSignals.reduce((sum, s) => sum + s.points, 0);

    // 2. Absence de salaire
    if (!jobAnalysis.salaryRange) {
      const signal: GhostJobSignal = {
        type: 'no_salary',
        severity: 'medium',
        description: 'Aucune indication de salaire',
        points: 15,
      };
      signals.push(signal);
      totalScore += signal.points;
    }

    // 3. Mismatch entre seniority et expérience demandée
    const mismatchSignal = this.detectSeniorityMismatch(jobAnalysis);
    if (mismatchSignal) {
      signals.push(mismatchSignal);
      totalScore += mismatchSignal.points;
    }

    // 4. Trop de technologies demandées (unrealistic requirements)
    const techOverloadSignal = this.detectTechOverload(jobAnalysis);
    if (techOverloadSignal) {
      signals.push(techOverloadSignal);
      totalScore += techOverloadSignal.points;
    }

    // 5. Check si offre repostée fréquemment (via cache)
    if (jobUrl) {
      const repostSignal = await this.detectReposting(jobUrl);
      if (repostSignal) {
        signals.push(repostSignal);
        totalScore += repostSignal.points;
      }
    }

    // 6. Manque de spécificité dans les problèmes à résoudre
    if (jobAnalysis.problemsToSolve.length === 0) {
      const signal: GhostJobSignal = {
        type: 'no_problems_defined',
        severity: 'medium',
        description: 'Aucun problème concret à résoudre mentionné',
        points: 10,
      };
      signals.push(signal);
      totalScore += signal.points;
    }

    // 7. Analyse des données entreprise si disponibles
    if (companyData) {
      const companySignals = this.analyzeCompanyData(companyData);
      signals.push(...companySignals);
      totalScore += companySignals.reduce((sum, s) => sum + s.points, 0);
    }

    // Normalise le score à 0-100
    const normalizedScore = Math.min(100, totalScore);

    // Détermine le niveau de risque
    const riskLevel = this.calculateRiskLevel(normalizedScore);

    // Détermine la recommandation
    const recommendation = this.getRecommendation(normalizedScore, signals);

    // Génère le raisonnement
    const reasoning = this.generateReasoning(normalizedScore, signals, riskLevel);

    // Calcule le niveau de confiance
    const confidenceLevel = this.calculateConfidence(signals);

    return {
      score: normalizedScore,
      riskLevel,
      signals,
      recommendation,
      reasoning,
      confidenceLevel,
    };
  }

  /**
   * Détecte les descriptions vagues et génériques
   */
  private static detectVagueness(jobAnalysis: JobAnalysis): GhostJobSignal[] {
    const signals: GhostJobSignal[] = [];

    // Peu de mots-clés techniques = description vague
    const techKeywords = jobAnalysis.keywords.technical;
    if (techKeywords.length < 3) {
      signals.push({
        type: 'vague_description',
        severity: 'high',
        description: `Seulement ${techKeywords.length} technologies mentionnées (description trop vague)`,
        points: 20,
      });
    }

    // Analyse du contexte des keywords
    const lowImportanceKeywords = jobAnalysis.keywordContext.filter(
      (kw) => kw.importance < 0.3
    );
    if (lowImportanceKeywords.length > jobAnalysis.keywordContext.length / 2) {
      signals.push({
        type: 'low_keyword_importance',
        severity: 'medium',
        description: 'La plupart des mots-clés ont une faible importance',
        points: 15,
      });
    }

    // Problèmes flous
    const vagueProblems = jobAnalysis.problemsToSolve.filter((p) =>
      this.isVagueProblem(p)
    );
    if (vagueProblems.length > 0) {
      signals.push({
        type: 'vague_problems',
        severity: 'medium',
        description: 'Problèmes à résoudre décrits de manière trop générique',
        points: 10,
      });
    }

    return signals;
  }

  /**
   * Détecte un mismatch entre seniority et années d'expérience
   */
  private static detectSeniorityMismatch(
    jobAnalysis: JobAnalysis
  ): GhostJobSignal | null {
    if (!jobAnalysis.requiredYearsExperience) return null;

    const { seniorityLevel, requiredYearsExperience } = jobAnalysis;

    // Règles normales:
    // junior: 0-2 ans
    // mid: 2-5 ans
    // senior: 5-8 ans
    // lead/principal: 8+ ans

    let expectedMinYears = 0;
    let expectedMaxYears = 20;

    switch (seniorityLevel) {
      case 'junior':
        expectedMaxYears = 2;
        break;
      case 'mid':
        expectedMinYears = 2;
        expectedMaxYears = 5;
        break;
      case 'senior':
        expectedMinYears = 5;
        expectedMaxYears = 8;
        break;
      case 'lead':
      case 'principal':
        expectedMinYears = 8;
        break;
    }

    if (
      requiredYearsExperience < expectedMinYears ||
      requiredYearsExperience > expectedMaxYears
    ) {
      return {
        type: 'seniority_mismatch',
        severity: 'high',
        description: `${requiredYearsExperience} ans demandés pour un poste ${seniorityLevel} (incohérent)`,
        points: 25,
      };
    }

    return null;
  }

  /**
   * Détecte une surcharge technologique (trop de tech demandées)
   */
  private static detectTechOverload(
    jobAnalysis: JobAnalysis
  ): GhostJobSignal | null {
    const totalTech =
      jobAnalysis.keywords.technical.length + jobAnalysis.keywords.tools.length;

    // Plus de 15 technologies = red flag
    if (totalTech > 15) {
      return {
        type: 'tech_overload',
        severity: 'high',
        description: `${totalTech} technologies requises (irréaliste pour un seul poste)`,
        points: 20,
      };
    }

    // Plus de 10 pour junior/mid = suspect
    if (
      totalTech > 10 &&
      (jobAnalysis.seniorityLevel === 'junior' ||
        jobAnalysis.seniorityLevel === 'mid')
    ) {
      return {
        type: 'tech_overload',
        severity: 'medium',
        description: `${totalTech} technologies pour un poste ${jobAnalysis.seniorityLevel} (trop exigeant)`,
        points: 15,
      };
    }

    return null;
  }

  /**
   * Détecte si l'offre a été repostée fréquemment
   */
  private static async detectReposting(jobUrl: string): Promise<GhostJobSignal | null> {
    try {
      const urlHash = crypto.createHash('sha256').update(jobUrl).digest('hex');

      // Check combien de fois cette URL a été analysée
      const { data, error } = await supabase
        .from('job_analyses')
        .select('created_at')
        .eq('job_url', jobUrl)
        .order('created_at', { ascending: false });

      if (error || !data || data.length <= 1) {
        return null;
      }

      // Si plus de 2 analyses avec des dates différentes
      const uniqueDates = new Set(
        data.map((d) => d.created_at.split('T')[0])
      );

      if (uniqueDates.size >= 3) {
        return {
          type: 'frequent_reposting',
          severity: 'high',
          description: `Offre repostée ${uniqueDates.size} fois (probablement pas un vrai recrutement)`,
          points: 30,
        };
      }
    } catch (error) {
      console.error('Error checking reposting:', error);
    }

    return null;
  }

  /**
   * Analyse les données de l'entreprise
   */
  private static analyzeCompanyData(
    companyData: CompanyEnrichment
  ): GhostJobSignal[] {
    const signals: GhostJobSignal[] = [];

    // Entreprise sans site web = suspect
    if (!companyData.website) {
      signals.push({
        type: 'no_website',
        severity: 'medium',
        description: 'Entreprise sans site web identifiable',
        points: 10,
      });
    }

    // Aucune actualité récente = entreprise fantôme?
    if (companyData.recentNews.length === 0) {
      signals.push({
        type: 'no_recent_news',
        severity: 'low',
        description: 'Aucune actualité récente trouvée sur l\'entreprise',
        points: 5,
      });
    }

    // Aucun produit notable = suspect
    if (companyData.notableProducts.length === 0) {
      signals.push({
        type: 'no_products',
        severity: 'low',
        description: 'Aucun produit ou service clairement identifié',
        points: 5,
      });
    }

    return signals;
  }

  /**
   * Vérifie si un problème est vague
   */
  private static isVagueProblem(problem: string): boolean {
    const vagueTerms = [
      'améliorer',
      'optimiser',
      'développer',
      'gérer',
      'participer',
      'contribuer',
      'aider',
    ];

    const problemLower = problem.toLowerCase();
    return vagueTerms.some((term) => problemLower.includes(term)) &&
           problem.length < 50; // Court et vague
  }

  /**
   * Calcule le niveau de risque basé sur le score
   */
  private static calculateRiskLevel(score: number): GhostJobRiskLevel {
    if (score < 20) return 'LOW';
    if (score < 40) return 'MEDIUM';
    if (score < 60) return 'HIGH';
    return 'VERY_HIGH';
  }

  /**
   * Génère une recommandation
   */
  private static getRecommendation(
    score: number,
    signals: GhostJobSignal[]
  ): 'APPLY' | 'APPLY_WITH_CAUTION' | 'SKIP' {
    if (score < 30) return 'APPLY';
    if (score < 60) return 'APPLY_WITH_CAUTION';
    return 'SKIP';
  }

  /**
   * Génère le raisonnement textuel
   */
  private static generateReasoning(
    score: number,
    signals: GhostJobSignal[],
    riskLevel: GhostJobRiskLevel
  ): string {
    const highSeveritySignals = signals.filter((s) => s.severity === 'high');

    if (score < 20) {
      return 'Cette offre semble légitime. Aucun signal suspect majeur détecté.';
    }

    if (score < 40) {
      return `Quelques signaux suspects détectés (score: ${score}/100). Vérifiez les détails de l'offre avant de postuler.`;
    }

    if (score < 60) {
      const mainIssues = highSeveritySignals
        .map((s) => s.description)
        .slice(0, 2)
        .join(', ');
      return `Plusieurs signaux d'alerte (score: ${score}/100): ${mainIssues}. Postulez avec prudence.`;
    }

    const mainIssues = highSeveritySignals
      .map((s) => s.description)
      .slice(0, 3)
      .join(', ');
    return `Score élevé de ghost job (${score}/100). Signaux critiques: ${mainIssues}. Il est recommandé de ne pas postuler.`;
  }

  /**
   * Calcule le niveau de confiance de la détection
   */
  private static calculateConfidence(signals: GhostJobSignal[]): number {
    // Plus il y a de signaux variés, plus on est confiant
    const uniqueTypes = new Set(signals.map((s) => s.type));
    const highSeverityCount = signals.filter((s) => s.severity === 'high').length;

    let confidence = 0.5; // Base

    // +0.1 par type unique de signal (max +0.3)
    confidence += Math.min(0.3, uniqueTypes.size * 0.1);

    // +0.05 par signal haute sévérité (max +0.2)
    confidence += Math.min(0.2, highSeverityCount * 0.05);

    return Math.min(1, confidence);
  }
}
