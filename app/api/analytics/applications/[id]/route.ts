import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics.service';
import type { UpdateApplicationStatusInput } from '@/lib/services/analytics.service';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/analytics/applications/[id]
 * Met à jour le statut d'une candidature
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const body = await request.json();

    // Validation
    if (!body.status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: status',
        },
        { status: 400 }
      );
    }

    const update: UpdateApplicationStatusInput = {
      status: body.status,
      responseDate: body.responseDate,
      notes: body.notes,
    };

    const success = await analyticsService.updateApplicationStatus(applicationId, update);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update application',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully',
    });
  } catch (error) {
    console.error('Error in PATCH /api/analytics/applications/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update application',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/analytics/applications/[id]
 * Supprime une candidature
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;

    const success = await analyticsService.deleteApplication(applicationId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete application',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/analytics/applications/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete application',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/applications/[id]
 * Récupère les événements d'une candidature
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;

    const events = await analyticsService.getApplicationEvents(applicationId);

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Error in GET /api/analytics/applications/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch application events',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
