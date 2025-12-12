import { NextRequest, NextResponse } from 'next/server';
import { getPDFGenerator } from '@/lib/services/pdf-generator.service';
import { CoverLetterContent } from '@/lib/types';

// ============================================================================
// API ROUTE - EXPORT COVER LETTER PDF
// ============================================================================

/**
 * POST /api/export-letter-pdf
 *
 * Génère et retourne un PDF de la lettre de motivation
 *
 * Body:
 * - letterContent: CoverLetterContent - Le contenu de la lettre à convertir en PDF
 * - filename?: string - Nom du fichier (optionnel, par défaut: "Lettre_Motivation.pdf")
 *
 * Response:
 * - PDF file with appropriate headers
 */
export async function POST(request: NextRequest) {
  try {
    // Parse le body
    const body = await request.json();
    const { letterContent, filename = 'Lettre_Motivation.pdf' } = body;

    // Validation
    if (!letterContent) {
      return NextResponse.json(
        { error: 'Missing letterContent in request body' },
        { status: 400 }
      );
    }

    // Validation basique de la structure
    if (!letterContent.greeting || !letterContent.signature) {
      return NextResponse.json(
        { error: 'Invalid letter content: missing required fields' },
        { status: 400 }
      );
    }

    // Génération du PDF
    const pdfGenerator = getPDFGenerator();
    const pdfBuffer = await pdfGenerator.generateCoverLetterPDF(letterContent as CoverLetterContent);

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(filename);

    // Retourner le PDF avec les headers appropriés
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${sanitizedFilename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('[API] Error generating cover letter PDF:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Sanitize filename pour éviter les injections
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and special characters
  let sanitized = filename.replace(/[\/\\:\*\?"<>\|]/g, '_');

  // Ensure .pdf extension
  if (!sanitized.toLowerCase().endsWith('.pdf')) {
    sanitized = sanitized.replace(/\.[^.]*$/, '') + '.pdf';
  }

  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 251) + '.pdf';
  }

  return sanitized || 'Lettre_Motivation.pdf';
}
