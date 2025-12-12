import { NextRequest, NextResponse } from 'next/server';
import { recommendationsService } from '@/lib/services/recommendations.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/recommendations
 * Récupère les recommandations personnalisées
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userProfileId = searchParams.get('user_profile_id') || undefined;

    const recommendations = await recommendationsService.generateRecommendations(userProfileId);

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error in GET /api/analytics/recommendations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate recommendations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
