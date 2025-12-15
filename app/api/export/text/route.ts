import { NextRequest, NextResponse } from 'next/server';
import { CVGeneratorService } from '@/lib/services/cv-generator.service';
import { CVContent } from '@/lib/types';

/**
 * POST /api/export-text
 * Exporte un CV au format texte
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cvContent } = body;

    if (!cvContent) {
      return NextResponse.json(
        { error: 'Missing cvContent' },
        { status: 400 }
      );
    }

    // Convertit le CV en texte
    const text = CVGeneratorService.cvContentToText(cvContent as CVContent);

    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="cv.txt"',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/export-text:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to export CV',
      },
      { status: 500 }
    );
  }
}
