import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics.service';
import type { CreateApplicationInput } from '@/lib/services/analytics.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/applications
 * Récupère toutes les candidatures avec filtres optionnels
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = {
      status: searchParams.get('status') || undefined,
      cvVariant: searchParams.get('cv_variant') || undefined,
      channel: searchParams.get('channel') || undefined,
      fromDate: searchParams.get('from_date') || undefined,
      toDate: searchParams.get('to_date') || undefined,
    };

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined)
    ) as any;

    const applications = await analyticsService.getApplications(undefined, cleanFilters);

    return NextResponse.json({
      success: true,
      data: applications,
      count: applications.length,
    });
  } catch (error) {
    console.error('Error in GET /api/analytics/applications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch applications',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/applications
 * Crée une nouvelle candidature
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation basique
    if (!body.userProfileId || !body.jobTitle || !body.company || !body.cvVariant || !body.channel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['userProfileId', 'jobTitle', 'company', 'cvVariant', 'channel'],
        },
        { status: 400 }
      );
    }

    const input: CreateApplicationInput = {
      userProfileId: body.userProfileId,
      jobTitle: body.jobTitle,
      company: body.company,
      jobUrl: body.jobUrl,
      cvVariant: body.cvVariant,
      letterVariant: body.letterVariant,
      channel: body.channel,
      appliedDate: body.appliedDate,
      notes: body.notes,
      cvFilePath: body.cvFilePath,
      letterFilePath: body.letterFilePath,
    };

    const application = await analyticsService.trackApplication(input);

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create application',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: application,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/analytics/applications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create application',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
