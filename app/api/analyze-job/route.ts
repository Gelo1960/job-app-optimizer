import { NextRequest, NextResponse } from 'next/server';
import { JobAnalyzerService } from '@/lib/services/job-analyzer.service';

/**
 * POST /api/analyze-job
 * Analyse une offre d'emploi et retourne les données structurées
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobText, jobUrl } = body;

    if (!jobText || typeof jobText !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid jobText' },
        { status: 400 }
      );
    }

    if (jobText.length < 100) {
      return NextResponse.json(
        { error: 'Job text too short (minimum 100 characters)' },
        { status: 400 }
      );
    }

    // Analyse l'offre
    const analysis = await JobAnalyzerService.analyzeJob(jobText, jobUrl);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('Error in /api/analyze-job:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze job',
      },
      { status: 500 }
    );
  }
}
