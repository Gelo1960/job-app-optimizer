// ============================================================================
// SERVICE DE GÉNÉRATION DE COLD EMAILS
// Génère des emails personnalisés avec Claude
// ============================================================================

import {
  ColdEmail,
  EmailVariant,
  EmailTone,
  UserProfile,
  JobAnalysis,
  CompanyEnrichment,
  Contact
} from '@/lib/types';
import { ClaudeService } from './claude.service';
import {
  COLD_EMAIL_SYSTEM_PROMPT,
  generateColdEmailPrompt,
} from '@/lib/prompts/cold-email.prompt';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ColdEmailGenerationParams {
  userProfile: UserProfile;
  jobAnalysis: JobAnalysis;
  companyEnrichment: CompanyEnrichment;
  contactInfo?: Contact;
  tones?: EmailTone[]; // Si non fourni, génère les 3 tons
}

interface EmailResponse {
  subject: string;
  bodyHtml: string;
  bodyPlainText: string;
  personalizationNotes?: string;
}

// ============================================================================
// CLASSE PRINCIPALE
// ============================================================================

export class ColdEmailGeneratorService {
  // --------------------------------------------------------------------------
  // GÉNÉRATION PRINCIPALE
  // --------------------------------------------------------------------------

  async generateColdEmail(params: ColdEmailGenerationParams): Promise<ColdEmail> {
    const {
      userProfile,
      jobAnalysis,
      companyEnrichment,
      contactInfo,
      tones = ['formal', 'friendly', 'direct']
    } = params;

    console.log(`[ColdEmailGenerator] Generating emails for ${companyEnrichment.companyName}`);

    // Générer chaque variante de ton
    const variants: { [K in EmailTone]?: EmailVariant } = {};

    for (const tone of tones) {
      try {
        const variant = await this.generateVariant(
          tone,
          userProfile,
          jobAnalysis,
          companyEnrichment,
          contactInfo
        );
        variants[tone] = variant;
      } catch (error) {
        console.error(`[ColdEmailGenerator] Error generating ${tone} variant:`, error);
        // Continue avec les autres tons même si un échoue
      }
    }

    // S'assurer qu'on a au moins les 3 tons principaux
    const finalVariants = {
      formal: variants.formal || this.getFallbackVariant('formal'),
      friendly: variants.friendly || this.getFallbackVariant('friendly'),
      direct: variants.direct || this.getFallbackVariant('direct'),
    };

    // Calculer le score de qualité
    const qualityScore = this.calculateQualityScore(finalVariants, params);

    const coldEmail: ColdEmail = {
      id: uuidv4(),
      variants: finalVariants,
      recipientInfo: contactInfo,
      qualityScore,
      generatedAt: new Date().toISOString(),
      metadata: {
        jobTitle: jobAnalysis.problemsToSolve[0] || userProfile.targetRole,
        company: companyEnrichment.companyName,
        userProfileId: userProfile.id,
      },
    };

    return coldEmail;
  }

  // --------------------------------------------------------------------------
  // GÉNÉRATION D'UNE VARIANTE
  // --------------------------------------------------------------------------

  private async generateVariant(
    tone: EmailTone,
    userProfile: UserProfile,
    jobAnalysis: JobAnalysis,
    companyEnrichment: CompanyEnrichment,
    contactInfo?: Contact
  ): Promise<EmailVariant> {
    console.log(`[ColdEmailGenerator] Generating ${tone} variant`);

    const prompt = generateColdEmailPrompt(
      tone,
      userProfile,
      jobAnalysis,
      companyEnrichment,
      contactInfo?.name,
      contactInfo?.title
    );

    const response = await ClaudeService.sendPromptJSON<EmailResponse>(
      prompt,
      COLD_EMAIL_SYSTEM_PROMPT
    );

    return {
      subject: response.subject,
      bodyHtml: this.ensureHtmlFormatting(response.bodyHtml),
      bodyPlainText: response.bodyPlainText,
      tone,
    };
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  private ensureHtmlFormatting(html: string): string {
    // S'assurer que le HTML est bien formaté
    if (!html.includes('<p>') && !html.includes('<div>')) {
      // Convertir les sauts de ligne en paragraphes
      const paragraphs = html.split('\n\n').filter(p => p.trim());
      return paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n');
    }
    return html;
  }

  private getFallbackVariant(tone: EmailTone): EmailVariant {
    // Variante de fallback si la génération échoue
    const fallbacks = {
      formal: {
        subject: 'Exploring opportunities at [Company]',
        bodyHtml: '<p>Dear Hiring Manager,</p><p>I am reaching out to explore potential opportunities at your organization.</p><p>Best regards</p>',
        bodyPlainText: 'Dear Hiring Manager,\n\nI am reaching out to explore potential opportunities at your organization.\n\nBest regards',
      },
      friendly: {
        subject: 'Quick chat about [Company]?',
        bodyHtml: '<p>Hi there,</p><p>I\'ve been following your work and would love to connect.</p><p>Cheers</p>',
        bodyPlainText: 'Hi there,\n\nI\'ve been following your work and would love to connect.\n\nCheers',
      },
      direct: {
        subject: '[Skill] for [Project]',
        bodyHtml: '<p>Hi,</p><p>Saw your work on [project]. Worth 15 min to discuss?</p>',
        bodyPlainText: 'Hi,\n\nSaw your work on [project]. Worth 15 min to discuss?',
      },
    };

    return {
      ...fallbacks[tone],
      tone,
    };
  }

  // --------------------------------------------------------------------------
  // SCORING
  // --------------------------------------------------------------------------

  private calculateQualityScore(
    variants: { [K in EmailTone]: EmailVariant },
    params: ColdEmailGenerationParams
  ): number {
    let score = 50; // Base score

    // Vérifier la personnalisation
    const hasCompanyResearch = Object.values(variants).some(v =>
      v.bodyPlainText.toLowerCase().includes(params.companyEnrichment.companyName.toLowerCase())
    );
    if (hasCompanyResearch) score += 15;

    // Vérifier la mention de produits/actualités
    const hasRecentNews = params.companyEnrichment.recentNews.length > 0;
    const mentionsNews = Object.values(variants).some(v => {
      const body = v.bodyPlainText.toLowerCase();
      return params.companyEnrichment.recentNews.some(news =>
        body.includes(news.title.toLowerCase().slice(0, 20))
      );
    });
    if (hasRecentNews && mentionsNews) score += 10;

    // Vérifier la longueur (pas trop long)
    const avgLength = Object.values(variants).reduce(
      (sum, v) => sum + v.bodyPlainText.split(' ').length,
      0
    ) / 3;
    if (avgLength >= 80 && avgLength <= 150) {
      score += 10;
    } else if (avgLength > 150) {
      score -= 10; // Pénalité pour emails trop longs
    }

    // Vérifier la présence d'un CTA clair
    const hasCTA = Object.values(variants).some(v =>
      /\b(chat|call|discuss|coffee|meet|15 min|quick|conversation)\b/i.test(v.bodyPlainText)
    );
    if (hasCTA) score += 10;

    // Bonus si on a le nom du contact
    if (params.contactInfo?.name) score += 5;

    // Vérifier qu'on évite les red flags
    const hasRedFlags = Object.values(variants).some(v => {
      const body = v.bodyPlainText.toLowerCase();
      return (
        body.includes('i hope this email finds you well') ||
        body.includes('i am writing to') ||
        body.includes('to whom it may concern') ||
        body.length > 1000
      );
    });
    if (hasRedFlags) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  // --------------------------------------------------------------------------
  // A/B TESTING VARIANTS
  // --------------------------------------------------------------------------

  async generateSubjectLineVariants(originalSubject: string): Promise<string[]> {
    const prompt = `Génère 3 variations de cette subject line pour A/B testing:
"${originalSubject}"

Teste:
1. Curiosité-driven
2. Valeur-driven
3. Personnalisation-driven

Format JSON:
\`\`\`json
{
  "variants": ["variant1", "variant2", "variant3"]
}
\`\`\``;

    const response = await ClaudeService.sendPromptJSON<{ variants: string[] }>(
      prompt,
      COLD_EMAIL_SYSTEM_PROMPT
    );

    return response.variants;
  }

  // --------------------------------------------------------------------------
  // EXPORT UTILITIES
  // --------------------------------------------------------------------------

  exportAsPlainText(coldEmail: ColdEmail, tone: EmailTone): string {
    const variant = coldEmail.variants[tone];
    const recipient = coldEmail.recipientInfo?.name || '[Recipient Name]';

    return `To: ${coldEmail.recipientInfo?.email || '[recipient@company.com]'}
Subject: ${variant.subject}

${variant.bodyPlainText}

---
Generated: ${new Date(coldEmail.generatedAt).toLocaleDateString()}
Quality Score: ${coldEmail.qualityScore}/100
Tone: ${tone}`;
  }

  exportAsHTML(coldEmail: ColdEmail, tone: EmailTone): string {
    const variant = coldEmail.variants[tone];

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${variant.subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    p {
      margin: 1em 0;
    }
  </style>
</head>
<body>
  ${variant.bodyHtml}
</body>
</html>`;
  }

  // --------------------------------------------------------------------------
  // BATCH GENERATION (pour plusieurs entreprises)
  // --------------------------------------------------------------------------

  async generateBatch(
    userProfile: UserProfile,
    targets: Array<{
      jobAnalysis: JobAnalysis;
      companyEnrichment: CompanyEnrichment;
      contactInfo?: Contact;
    }>
  ): Promise<ColdEmail[]> {
    const results: ColdEmail[] = [];

    for (const target of targets) {
      try {
        const email = await this.generateColdEmail({
          userProfile,
          ...target,
        });
        results.push(email);

        // Rate limiting: attendre 1 seconde entre chaque génération
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[ColdEmailGenerator] Batch error for ${target.companyEnrichment.companyName}:`, error);
      }
    }

    return results;
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const coldEmailGeneratorService = new ColdEmailGeneratorService();
