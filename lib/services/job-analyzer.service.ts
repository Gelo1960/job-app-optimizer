import { JobAnalysis } from '../types';
import { ClaudeService } from './claude.service';
import {
  JOB_ANALYSIS_SYSTEM_PROMPT,
  createJobAnalysisPrompt,
} from '../prompts/job-analysis.prompt';
import { supabase } from '../db/supabase';
import crypto from 'crypto';

/**
 * Service d'analyse d'offres d'emploi
 * Extrait les données structurées et les met en cache
 */
export class JobAnalyzerService {
  /**
   * Analyse une offre d'emploi et retourne les données structurées
   * Utilise le cache Supabase pour éviter les appels API répétés
   */
  static async analyzeJob(
    jobText: string,
    jobUrl?: string
  ): Promise<JobAnalysis> {
    // Calcule un hash du texte pour le cache
    const textHash = this.hashJobText(jobText);

    // Vérifie le cache
    const cached = await this.getCachedAnalysis(textHash);
    if (cached) {
      console.log('✓ Job analysis found in cache');
      return cached;
    }

    console.log('→ Analyzing job with Claude...');

    // Appelle Claude pour l'analyse
    const prompt = createJobAnalysisPrompt(jobText);
    const analysis = await ClaudeService.sendPromptJSON<JobAnalysis>(
      prompt,
      JOB_ANALYSIS_SYSTEM_PROMPT
    );

    // Met en cache
    await this.cacheAnalysis(textHash, analysis, jobUrl);

    return analysis;
  }

  /**
   * Hash le texte de l'offre pour identifier les doublons
   */
  private static hashJobText(text: string): string {
    // Normalise le texte avant de hasher (enlève espaces multiples, etc.)
    const normalized = text.trim().replace(/\s+/g, ' ').toLowerCase();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Récupère une analyse depuis le cache Supabase
   */
  private static async getCachedAnalysis(
    textHash: string
  ): Promise<JobAnalysis | null> {
    try {
      const { data, error } = await supabase
        .from('job_analyses')
        .select('*')
        .eq('job_text_hash', textHash)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      // Reconstruit l'objet JobAnalysis
      return {
        keywords: data.keywords as any,
        keywordContext: data.keyword_context as any,
        formalityScore: data.formality_score,
        seniorityLevel: data.seniority_level as any,
        companyType: data.company_type as any,
        problemsToSolve: data.problems_to_solve as any,
        atsSystemGuess: data.ats_system_guess as any,
        salaryRange: data.salary_range as any,
        requiredYearsExperience: data.required_years_experience || undefined,
        remotePolicy: data.remote_policy as any,
      };
    } catch (error) {
      console.error('Error fetching cached job analysis:', error);
      return null;
    }
  }

  /**
   * Met en cache une analyse dans Supabase
   */
  private static async cacheAnalysis(
    textHash: string,
    analysis: JobAnalysis,
    jobUrl?: string
  ): Promise<void> {
    try {
      // Extrait company/job title si possible (pour recherche future)
      const companyName = this.extractCompanyName(analysis);
      const jobTitle = this.extractJobTitle(analysis);

      await supabase.from('job_analyses').upsert({
        job_text_hash: textHash,
        job_url: jobUrl,
        company_name: companyName,
        job_title: jobTitle,
        keywords: analysis.keywords,
        keyword_context: analysis.keywordContext,
        formality_score: analysis.formalityScore,
        seniority_level: analysis.seniorityLevel,
        company_type: analysis.companyType,
        problems_to_solve: analysis.problemsToSolve,
        ats_system_guess: analysis.atsSystemGuess,
        salary_range: analysis.salaryRange,
        required_years_experience: analysis.requiredYearsExperience,
        remote_policy: analysis.remotePolicy,
      });

      console.log('✓ Job analysis cached in Supabase');
    } catch (error) {
      console.error('Error caching job analysis:', error);
      // Non-bloquant: continue même si cache fail
    }
  }

  /**
   * Tente d'extraire le nom de l'entreprise depuis l'analyse
   */
  private static extractCompanyName(analysis: JobAnalysis): string | null {
    // Logique simple: cherche dans les contexts pour "chez X", "at X", etc.
    // À améliorer avec regex ou Claude si nécessaire
    return null;
  }

  /**
   * Tente d'extraire le titre du poste
   */
  private static extractJobTitle(analysis: JobAnalysis): string | null {
    // Peut être déduit des keywords techniques + seniority
    // Ex: "Senior React Native Developer" si seniorityLevel=senior et React Native in keywords
    return null;
  }

  /**
   * Calcule un score de "keyword match" entre un CV et une offre
   * Utile pour savoir si le CV est bien optimisé AVANT génération
   */
  static calculateKeywordMatchScore(
    cvText: string,
    jobAnalysis: JobAnalysis
  ): number {
    const allKeywords = [
      ...jobAnalysis.keywords.technical,
      ...jobAnalysis.keywords.business,
      ...jobAnalysis.keywords.tools,
    ];

    const cvLower = cvText.toLowerCase();
    const matchedKeywords = allKeywords.filter((keyword) =>
      cvLower.includes(keyword.toLowerCase())
    );

    return (matchedKeywords.length / allKeywords.length) * 100;
  }
}
