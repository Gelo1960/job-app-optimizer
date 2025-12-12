// ============================================================================
// SERVICE DE RECHERCHE DE CONTACTS
// Integration Hunter.io avec fallback gracieux
// ============================================================================

import { ContactSearchResult, Contact } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';

const HUNTER_API_KEY = process.env.HUNTER_IO_API_KEY;
const HUNTER_BASE_URL = 'https://api.hunter.io/v2';
const CACHE_DURATION_DAYS = 7;

interface HunterContact {
  first_name: string;
  last_name: string;
  position: string;
  email?: string;
  linkedin?: string;
  confidence?: number;
}

interface HunterResponse {
  data: {
    emails: HunterContact[];
  };
  meta: {
    results: number;
  };
}

// ============================================================================
// CLASSE PRINCIPALE
// ============================================================================

export class ContactFinderService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // --------------------------------------------------------------------------
  // RECHERCHE PRINCIPALE
  // --------------------------------------------------------------------------

  async findContacts(
    companyName: string,
    companyDomain?: string
  ): Promise<ContactSearchResult> {
    // 1. Vérifier le cache d'abord
    const cached = await this.getCachedContacts(companyName);
    if (cached) {
      console.log(`[ContactFinder] Cache hit for ${companyName}`);
      return cached;
    }

    // 2. Si Hunter.io API key disponible, utiliser l'API
    if (HUNTER_API_KEY && companyDomain) {
      try {
        const result = await this.searchWithHunter(companyName, companyDomain);
        await this.cacheContacts(companyName, result);
        return result;
      } catch (error) {
        console.error('[ContactFinder] Hunter.io error:', error);
        // Fallback to generic suggestions
      }
    }

    // 3. Fallback: suggestions génériques
    console.log(`[ContactFinder] Using fallback for ${companyName}`);
    const fallbackResult = this.generateFallbackSuggestions(companyName, companyDomain);
    await this.cacheContacts(companyName, fallbackResult);
    return fallbackResult;
  }

  // --------------------------------------------------------------------------
  // HUNTER.IO API INTEGRATION
  // --------------------------------------------------------------------------

  private async searchWithHunter(
    companyName: string,
    companyDomain: string
  ): Promise<ContactSearchResult> {
    const roles = [
      'recruiter',
      'talent acquisition',
      'hiring manager',
      'hr manager',
      'head of people',
      'talent partner'
    ];

    const contacts: Contact[] = [];

    // Rechercher pour chaque rôle clé
    for (const role of roles) {
      try {
        const url = `${HUNTER_BASE_URL}/domain-search?domain=${companyDomain}&seniority=senior&department=hr&api_key=${HUNTER_API_KEY}&limit=5`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Hunter.io API error: ${response.status}`);
        }

        const data: HunterResponse = await response.json();

        if (data.data.emails && data.data.emails.length > 0) {
          for (const hunterContact of data.data.emails) {
            contacts.push({
              name: `${hunterContact.first_name} ${hunterContact.last_name}`,
              title: hunterContact.position,
              email: hunterContact.email,
              linkedinUrl: hunterContact.linkedin,
              confidence: hunterContact.confidence || 0.5
            });
          }
        }
      } catch (error) {
        console.error(`[ContactFinder] Error searching role "${role}":`, error);
      }
    }

    // Organiser les contacts par rôle
    return this.organizeContacts(contacts);
  }

  // --------------------------------------------------------------------------
  // ORGANISATION DES CONTACTS
  // --------------------------------------------------------------------------

  private organizeContacts(contacts: Contact[]): ContactSearchResult {
    const result: ContactSearchResult = {
      alternativeContacts: []
    };

    // Identifier les rôles clés
    for (const contact of contacts) {
      const titleLower = contact.title.toLowerCase();

      if (!result.hiringManager && this.isHiringManager(titleLower)) {
        result.hiringManager = contact;
      } else if (!result.hrContact && this.isHRContact(titleLower)) {
        result.hrContact = contact;
      } else if (!result.teamLead && this.isTeamLead(titleLower)) {
        result.teamLead = contact;
      } else {
        result.alternativeContacts.push(contact);
      }
    }

    // Trier les contacts alternatifs par confiance
    result.alternativeContacts.sort((a, b) => b.confidence - a.confidence);

    return result;
  }

  private isHiringManager(title: string): boolean {
    const keywords = ['hiring manager', 'talent acquisition manager', 'recruiting manager'];
    return keywords.some(k => title.includes(k));
  }

  private isHRContact(title: string): boolean {
    const keywords = ['hr manager', 'human resources', 'people operations', 'head of people'];
    return keywords.some(k => title.includes(k));
  }

  private isTeamLead(title: string): boolean {
    const keywords = ['team lead', 'engineering manager', 'head of', 'director'];
    return keywords.some(k => title.includes(k));
  }

  // --------------------------------------------------------------------------
  // FALLBACK: SUGGESTIONS GÉNÉRIQUES
  // --------------------------------------------------------------------------

  private generateFallbackSuggestions(
    companyName: string,
    companyDomain?: string
  ): ContactSearchResult {
    const suggestions: Contact[] = [];

    // Générer des suggestions de format d'email basées sur le domaine
    if (companyDomain) {
      const emailFormats = [
        `recruiter@${companyDomain}`,
        `talent@${companyDomain}`,
        `hr@${companyDomain}`,
        `careers@${companyDomain}`,
        `jobs@${companyDomain}`
      ];

      for (const email of emailFormats) {
        suggestions.push({
          name: `${companyName} Recruitment Team`,
          title: 'Talent Acquisition',
          email,
          confidence: 0.3
        });
      }
    }

    // Suggestions LinkedIn
    suggestions.push({
      name: 'LinkedIn Search Suggested',
      title: 'Use LinkedIn to find recruiters',
      linkedinUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyName + ' recruiter')}`,
      confidence: 0.7
    });

    return {
      alternativeContacts: suggestions
    };
  }

  // --------------------------------------------------------------------------
  // CACHE MANAGEMENT
  // --------------------------------------------------------------------------

  private async getCachedContacts(companyName: string): Promise<ContactSearchResult | null> {
    try {
      const { data, error } = await this.supabase
        .from('contact_search_cache')
        .select('*')
        .eq('company_name', companyName)
        .gte('cached_at', new Date(Date.now() - CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      return data.contacts as ContactSearchResult;
    } catch (error) {
      console.error('[ContactFinder] Cache read error:', error);
      return null;
    }
  }

  private async cacheContacts(companyName: string, contacts: ContactSearchResult): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('contact_search_cache')
        .upsert({
          company_name: companyName,
          contacts,
          cached_at: new Date().toISOString()
        });

      if (error) {
        console.error('[ContactFinder] Cache write error:', error);
      }
    } catch (error) {
      console.error('[ContactFinder] Cache error:', error);
    }
  }

  // --------------------------------------------------------------------------
  // QUOTA MANAGEMENT
  // --------------------------------------------------------------------------

  async getQuotaStatus(): Promise<{
    available: boolean;
    remaining?: number;
    resetDate?: string;
  }> {
    if (!HUNTER_API_KEY) {
      return { available: false };
    }

    try {
      const response = await fetch(
        `${HUNTER_BASE_URL}/account?api_key=${HUNTER_API_KEY}`
      );

      if (!response.ok) {
        return { available: false };
      }

      const data = await response.json();

      return {
        available: true,
        remaining: data.data.requests.searches.available,
        resetDate: data.data.reset_date
      };
    } catch (error) {
      console.error('[ContactFinder] Quota check error:', error);
      return { available: false };
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const contactFinderService = new ContactFinderService();
