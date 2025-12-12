import { NextRequest, NextResponse } from 'next/server';
import { CompanyEnrichmentService } from '@/lib/services/company-enrichment.service';

/**
 * POST /api/enrich-company
 * Enrichit les informations d'une entreprise
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName } = body;

    if (!companyName || typeof companyName !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid companyName' },
        { status: 400 }
      );
    }

    if (companyName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Company name too short (minimum 2 characters)' },
        { status: 400 }
      );
    }

    // Enrichit l'entreprise
    const enrichment = await CompanyEnrichmentService.enrichCompany(companyName);

    return NextResponse.json({
      success: true,
      data: enrichment,
    });
  } catch (error: any) {
    console.error('Error in /api/enrich-company:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to enrich company',
      },
      { status: 500 }
    );
  }
}
