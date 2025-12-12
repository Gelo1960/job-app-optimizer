import { NextRequest, NextResponse } from 'next/server';
import { GhostJobDetectorService } from '@/lib/services/ghost-job-detector.service';
import { CompanyEnrichmentService } from '@/lib/services/company-enrichment.service';
import { JobAnalysis } from '@/lib/types';

/**
 * POST /api/detect-ghost-job
 * Détecte si une offre d'emploi est un "ghost job"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobAnalysis, companyName, jobUrl } = body;

    if (!jobAnalysis || typeof jobAnalysis !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid jobAnalysis' },
        { status: 400 }
      );
    }

    // Enrichit l'entreprise si nom fourni
    let companyData = undefined;
    if (companyName && typeof companyName === 'string' && companyName.trim().length > 0) {
      try {
        companyData = await CompanyEnrichmentService.enrichCompany(companyName);
      } catch (error) {
        console.warn('Failed to enrich company, continuing without company data:', error);
        // Continue sans les données entreprise
      }
    }

    // Détecte les ghost jobs
    const detection = await GhostJobDetectorService.detectGhostJob(
      jobAnalysis as JobAnalysis,
      companyData,
      jobUrl
    );

    return NextResponse.json({
      success: true,
      data: detection,
      companyData: companyData || null,
    });
  } catch (error: any) {
    console.error('Error in /api/detect-ghost-job:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to detect ghost job',
      },
      { status: 500 }
    );
  }
}
