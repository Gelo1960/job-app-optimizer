import { NextRequest, NextResponse } from 'next/server';
import { getPDFGenerator } from '@/lib/services/pdf-generator.service';
import { CVContent } from '@/lib/types';

// ============================================================================
// API ROUTE - EXPORT CV PDF
// ============================================================================

/**
 * POST /api/export-cv-pdf
 *
 * Génère et retourne un PDF du CV
 *
 * Body:
 * - cvContent: CVContent - Le contenu du CV à convertir en PDF
 * - filename?: string - Nom du fichier (optionnel, par défaut: "CV.pdf")
 *
 * Response:
 * - PDF file with appropriate headers
 */
export async function POST(request: NextRequest) {
  try {
    // Parse le body
    const body = await request.json();
    const { cvContent, filename = 'CV.pdf' } = body;

    // Validation
    if (!cvContent) {
      return NextResponse.json(
        { error: 'Missing cvContent in request body' },
        { status: 400 }
      );
    }

    // Validation basique de la structure
    if (!cvContent.header || !cvContent.header.name) {
      return NextResponse.json(
        { error: 'Invalid CV content: missing required fields' },
        { status: 400 }
      );
    }

    // Génération du PDF
    const pdfGenerator = getPDFGenerator();
    const pdfBuffer = await pdfGenerator.generateCVPDF(cvContent as CVContent);

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(filename);

    // Retourner le PDF avec les headers appropriés
    return new NextResponse(pdfBuffer, {
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
    console.error('[API] Error generating CV PDF:', error);

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

  return sanitized || 'CV.pdf';
}
