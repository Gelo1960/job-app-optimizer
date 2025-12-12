// ============================================================================
// API ROUTE: RECHERCHE DE CONTACTS
// Endpoint pour trouver des contacts avec Hunter.io
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { contactFinderService } from '@/lib/services/contact-finder.service';
import { ContactSearchResult } from '@/lib/types';

// ============================================================================
// POST /api/find-contacts
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, domain } = body;

    // Validation
    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Finding contacts for ${companyName}${domain ? ` (${domain})` : ''}`);

    // Rechercher les contacts
    const result: ContactSearchResult = await contactFinderService.findContacts(
      companyName,
      domain
    );

    // Vérifier le quota si Hunter.io est utilisé
    const quotaStatus = await contactFinderService.getQuotaStatus();

    return NextResponse.json({
      success: true,
      data: result,
      quota: quotaStatus,
      cached: false, // TODO: détecter si résultat vient du cache
    });
  } catch (error) {
    console.error('[API] Error in find-contacts:', error);

    return NextResponse.json(
      {
        error: 'Failed to find contacts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/find-contacts/quota
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const quotaStatus = await contactFinderService.getQuotaStatus();

    return NextResponse.json({
      success: true,
      quota: quotaStatus,
    });
  } catch (error) {
    console.error('[API] Error checking quota:', error);

    return NextResponse.json(
      {
        error: 'Failed to check quota',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
