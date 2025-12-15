import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/lib/services/profile.service';
import { getAuthenticatedUser } from '@/lib/db/server-actions';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const { data: profile, error } = await ProfileService.getFullProfile(user.id);

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('[API] Get Profile Error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
