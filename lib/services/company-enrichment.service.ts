import { CompanyEnrichment } from '../types';
import { ClaudeService } from './claude.service';
import {
  COMPANY_ENRICHMENT_SYSTEM_PROMPT,
  createCompanyEnrichmentPrompt,
  createSimpleWebScrapingPrompt,
} from '../prompts/company-enrichment.prompt';
import { supabase } from '../db/supabase';
import crypto from 'crypto';

/**
 * Service d'enrichissement d'informations sur les entreprises
 * Utilise web scraping + Brave Search API (optionnel) + cache Supabase
 */
export class CompanyEnrichmentService {
  private static readonly CACHE_DURATION_DAYS = 7;
  private static readonly BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY;

  /**
   * Enrichit les informations d'une entreprise
   * 1. Vérifie le cache Supabase
   * 2. Si non trouvé, utilise Brave Search API ou scraping basique
   * 3. Parse avec Claude
   * 4. Met en cache
   */
  static async enrichCompany(
    companyName: string
  ): Promise<CompanyEnrichment> {
    console.log(`→ Enriching company: ${companyName}`);

    // Normalise le nom pour le cache
    const normalizedName = this.normalizeCompanyName(companyName);
    const cacheKey = this.generateCacheKey(normalizedName);

    // Vérifie le cache
    const cached = await this.getCachedEnrichment(cacheKey);
    if (cached) {
      console.log('✓ Company enrichment found in cache');
      return cached;
    }

    try {
      // Collecte les données
      const scrapedData = await this.fetchCompanyData(normalizedName);

      // Parse avec Claude
      let enrichment: CompanyEnrichment;
      if (scrapedData && scrapedData.length > 50) {
        const prompt = createCompanyEnrichmentPrompt(normalizedName, scrapedData);
        enrichment = await ClaudeService.sendPromptJSON<CompanyEnrichment>(
          prompt,
          COMPANY_ENRICHMENT_SYSTEM_PROMPT
        );
      } else {
        // Fallback: données minimales
        console.log('⚠ Insufficient data, using fallback enrichment');
        const fallbackPrompt = createSimpleWebScrapingPrompt(normalizedName);
        enrichment = await ClaudeService.sendPromptJSON<CompanyEnrichment>(
          fallbackPrompt,
          COMPANY_ENRICHMENT_SYSTEM_PROMPT
        );
      }

      // Met en cache
      await this.cacheEnrichment(cacheKey, normalizedName, enrichment);

      console.log('✓ Company enrichment completed');
      return enrichment;
    } catch (error) {
      console.error('Error enriching company:', error);

      // Fallback ultime: données minimales sans Claude
      return this.createFallbackEnrichment(normalizedName);
    }
  }

  /**
   * Collecte les données sur l'entreprise
   * Utilise Brave Search API si disponible, sinon scraping basique
   */
  private static async fetchCompanyData(companyName: string): Promise<string> {
    if (this.BRAVE_API_KEY) {
      try {
        return await this.fetchWithBraveSearch(companyName);
      } catch (error) {
        console.error('Brave Search failed, falling back to basic search:', error);
      }
    }

    // Fallback: recherche basique simulée
    return await this.fetchBasicCompanyInfo(companyName);
  }

  /**
   * Utilise Brave Search API pour collecter des informations
   */
  private static async fetchWithBraveSearch(companyName: string): Promise<string> {
    const query = `${companyName} company about careers products`;
    const url = 'https://api.search.brave.com/res/v1/web/search';

    const response = await fetch(`${url}?q=${encodeURIComponent(query)}&count=10`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': this.BRAVE_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`Brave Search API error: ${response.status}`);
    }

    const data = await response.json();

    // Combine les résultats
    let combinedText = '';
    if (data.web?.results) {
      for (const result of data.web.results.slice(0, 5)) {
        combinedText += `\n\n=== ${result.title} ===\n`;
        combinedText += `URL: ${result.url}\n`;
        combinedText += `${result.description || ''}\n`;
      }
    }

    return combinedText;
  }

  /**
   * Collecte basique d'informations (fallback sans API externe)
   * Retourne une structure minimale qui sera enrichie par Claude
   */
  private static async fetchBasicCompanyInfo(companyName: string): Promise<string> {
    // Dans une vraie implémentation, on pourrait:
    // - Scraper le site web de l'entreprise si fourni
    // - Utiliser une base de données locale d'entreprises
    // - Interroger LinkedIn via l'API officielle

    // Pour l'instant, retourne le nom pour que Claude génère un fallback
    return `Company name: ${companyName}`;
  }

  /**
   * Crée un enrichissement minimal en cas d'échec total
   */
  private static createFallbackEnrichment(companyName: string): CompanyEnrichment {
    return {
      companyName,
      website: null,
      linkedinUrl: null,
      recentAchievements: [],
      painPoints: ['En cours de recrutement'],
      cultureKeywords: ['Innovation', 'Collaboration'],
      notableProducts: [],
      recentNews: [],
      employeeCount: null,
      funding: null,
    };
  }

  /**
   * Normalise le nom de l'entreprise pour le cache
   */
  private static normalizeCompanyName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  /**
   * Génère une clé de cache unique
   */
  private static generateCacheKey(normalizedName: string): string {
    return crypto.createHash('sha256').update(normalizedName).digest('hex');
  }

  /**
   * Récupère un enrichissement depuis le cache Supabase
   */
  private static async getCachedEnrichment(
    cacheKey: string
  ): Promise<CompanyEnrichment | null> {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() - this.CACHE_DURATION_DAYS);

      const { data, error } = await supabase
        .from('company_enrichments')
        .select('*')
        .eq('cache_key', cacheKey)
        .gt('created_at', expirationDate.toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      return {
        companyName: data.company_name,
        website: data.website,
        linkedinUrl: data.linkedin_url,
        recentAchievements: data.recent_achievements || [],
        painPoints: data.pain_points || [],
        cultureKeywords: data.culture_keywords || [],
        notableProducts: data.notable_products || [],
        recentNews: data.recent_news || [],
        employeeCount: data.employee_count,
        funding: data.funding,
      };
    } catch (error) {
      console.error('Error fetching cached enrichment:', error);
      return null;
    }
  }

  /**
   * Met en cache un enrichissement dans Supabase
   */
  private static async cacheEnrichment(
    cacheKey: string,
    companyName: string,
    enrichment: CompanyEnrichment
  ): Promise<void> {
    try {
      await supabase.from('company_enrichments').upsert({
        cache_key: cacheKey,
        company_name: companyName,
        website: enrichment.website,
        linkedin_url: enrichment.linkedinUrl,
        recent_achievements: enrichment.recentAchievements,
        pain_points: enrichment.painPoints,
        culture_keywords: enrichment.cultureKeywords,
        notable_products: enrichment.notableProducts,
        recent_news: enrichment.recentNews,
        employee_count: enrichment.employeeCount,
        funding: enrichment.funding,
        created_at: new Date().toISOString(),
      });

      console.log('✓ Company enrichment cached in Supabase');
    } catch (error) {
      console.error('Error caching enrichment:', error);
      // Non-bloquant: continue même si cache fail
    }
  }
}
