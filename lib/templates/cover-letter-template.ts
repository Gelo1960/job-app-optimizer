import { CoverLetterContent } from '@/lib/types';

// ============================================================================
// TEMPLATE LETTRE DE MOTIVATION - PROFESSIONAL & ATS-FRIENDLY
// ============================================================================

/**
 * Génère le HTML d'une lettre de motivation professionnelle
 * - Format lettre standard
 * - Texte sélectionnable
 * - Structure claire
 * - Design professionnel
 */
export function generateCoverLetterHTML(letter: CoverLetterContent): string {
  const {
    greeting,
    hook,
    credibility,
    uniqueValue,
    culturalFit,
    cta,
    signature,
  } = letter;

  // Date du jour au format français
  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lettre de Motivation</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
      padding: 25mm 20mm;
    }

    /* Header with date */
    .letter-date {
      text-align: right;
      font-size: 10pt;
      color: #4b5563;
      margin-bottom: 30px;
    }

    /* Greeting */
    .greeting {
      font-size: 11pt;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
    }

    /* Paragraphs */
    .paragraph {
      font-size: 11pt;
      line-height: 1.7;
      color: #1f2937;
      text-align: justify;
      margin-bottom: 16px;
      text-indent: 0;
    }

    .paragraph:first-of-type {
      margin-top: 0;
    }

    /* Signature */
    .signature-section {
      margin-top: 30px;
    }

    .cta {
      font-size: 11pt;
      line-height: 1.7;
      color: #1f2937;
      text-align: justify;
      margin-bottom: 24px;
    }

    .signature {
      text-align: left;
      margin-top: 20px;
    }

    .signature-greeting {
      font-size: 11pt;
      color: #1f2937;
      margin-bottom: 30px;
    }

    .signature-name {
      font-size: 11pt;
      font-weight: 600;
      color: #1f2937;
    }

    /* Print optimizations */
    @media print {
      body {
        padding: 0;
      }
    }

    /* Page break control */
    .no-break {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <!-- Date -->
  <div class="letter-date">
    ${escapeHtml(formattedDate)}
  </div>

  <!-- Greeting -->
  <div class="greeting">
    ${escapeHtml(greeting)}
  </div>

  <!-- Hook - Pain Point -->
  <div class="paragraph no-break">
    ${escapeHtml(hook)}
  </div>

  <!-- Credibility - Preuves -->
  <div class="paragraph no-break">
    ${escapeHtml(credibility)}
  </div>

  <!-- Unique Value - Profil Hybride -->
  <div class="paragraph no-break">
    ${escapeHtml(uniqueValue)}
  </div>

  <!-- Cultural Fit - Recherche Entreprise -->
  <div class="paragraph no-break">
    ${escapeHtml(culturalFit)}
  </div>

  <!-- Signature Section -->
  <div class="signature-section no-break">
    <!-- CTA - Call to Action -->
    <div class="cta">
      ${escapeHtml(cta)}
    </div>

    <!-- Signature -->
    <div class="signature">
      <div class="signature-greeting">
        Cordialement,
      </div>
      <div class="signature-name">
        ${escapeHtml(signature)}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ============================================================================
// HELPERS
// ============================================================================

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}
