import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/ab-testing
 * Récupère les résultats A/B testing
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userProfileId = searchParams.get('user_profile_id') || undefined;

    const results = await analyticsService.getABTestResults(userProfileId);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error in GET /api/analytics/ab-testing:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch A/B test results',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
