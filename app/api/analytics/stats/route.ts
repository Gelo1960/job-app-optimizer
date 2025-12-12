import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/stats
 * Récupère toutes les statistiques pour l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userProfileId = searchParams.get('user_profile_id') || undefined;

    const stats = await analyticsService.getUserStatistics(userProfileId);

    if (!stats) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch statistics',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error in GET /api/analytics/stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
