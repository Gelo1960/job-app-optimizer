// ============================================================================
// API ROUTE: GÉNÉRATION DE COLD EMAILS
// Endpoint pour générer des cold emails personnalisés
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { coldEmailGeneratorService } from '@/lib/services/cold-email-generator.service';
import { ColdEmail, EmailTone, JobAnalysis, CompanyEnrichment, Contact } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================================================
// POST /api/generate-cold-email
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userProfileId,
      jobAnalysis,
      companyEnrichment,
      contactInfo,
      tones,
    } = body;

    // Validation
    if (!userProfileId) {
      return NextResponse.json(
        { error: 'User profile ID is required' },
        { status: 400 }
      );
    }

    if (!jobAnalysis) {
      return NextResponse.json(
        { error: 'Job analysis is required' },
        { status: 400 }
      );
    }

    if (!companyEnrichment) {
      return NextResponse.json(
        { error: 'Company enrichment is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Generating cold email for user ${userProfileId}`);

    // Récupérer le profil utilisateur
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userProfileId)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Générer le cold email
    const coldEmail: ColdEmail = await coldEmailGeneratorService.generateColdEmail({
      userProfile,
      jobAnalysis: jobAnalysis as JobAnalysis,
      companyEnrichment: companyEnrichment as CompanyEnrichment,
      contactInfo: contactInfo as Contact | undefined,
      tones: tones as EmailTone[] | undefined,
    });

    // Sauvegarder dans la base de données (optionnel, pour historique)
    try {
      await supabase.from('cold_emails').insert({
        id: coldEmail.id,
        user_id: userProfileId,
        company_name: companyEnrichment.companyName,
        recipient_name: contactInfo?.name,
        recipient_email: contactInfo?.email,
        variants: coldEmail.variants,
        quality_score: coldEmail.qualityScore,
        metadata: coldEmail.metadata,
        created_at: coldEmail.generatedAt,
      });
    } catch (dbError) {
      console.error('[API] Failed to save cold email to DB:', dbError);
      // Continue même si la sauvegarde échoue
    }

    return NextResponse.json({
      success: true,
      data: coldEmail,
    });
  } catch (error) {
    console.error('[API] Error in generate-cold-email:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate cold email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/generate-cold-email/history
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userProfileId = searchParams.get('userProfileId');

    if (!userProfileId) {
      return NextResponse.json(
        { error: 'User profile ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cold_emails')
      .select('*')
      .eq('user_id', userProfileId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('[API] Error fetching cold email history:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch cold email history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
