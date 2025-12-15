import { NextRequest, NextResponse } from 'next/server';
import { CVGeneratorService } from '@/lib/services/cv-generator.service';
import { getAuthenticatedClient } from '@/lib/db/server-actions';
import { UserProfile, JobAnalysis } from '@/lib/types';

/**
 * POST /api/generate-cv
 * Génère un CV optimisé pour une offre d'emploi
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getAuthenticatedClient();
    const body = await request.json();
    const { userProfileId, jobAnalysis, variant, optimizationLevel } = body;

    // Validation
    if (!userProfileId || !jobAnalysis || !variant) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Récupère le profil utilisateur depuis Supabase
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userProfileId)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Récupère les données liées (projets, expériences, etc.)
    const [
      { data: projects },
      { data: experiences },
      { data: education },
      { data: skills },
    ] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('user_profile_id', userProfileId)
        .order('display_order', { ascending: true }),

      supabase
        .from('experiences')
        .select('*')
        .eq('user_profile_id', userProfileId)
        .order('display_order', { ascending: true }),

      supabase
        .from('education')
        .select('*')
        .eq('user_profile_id', userProfileId)
        .order('display_order', { ascending: true }),

      supabase
        .from('skills')
        .select('*')
        .eq('user_profile_id', userProfileId)
        .order('display_order', { ascending: true }),
    ]);

    // Reconstruit le UserProfile complet
    const userProfile: UserProfile = {
      id: profileData.id,
      firstName: profileData.first_name,
      lastName: profileData.last_name,
      email: profileData.email,
      phone: profileData.phone,
      location: profileData.location,
      linkedinUrl: profileData.linkedin_url,
      githubUrl: profileData.github_url,
      portfolioUrl: profileData.portfolio_url,
      profileVariants: profileData.profile_variants as any,
      projects: projects || [],
      experiences: experiences || [],
      education: education || [],
      skills: {
        technical:
          skills
            ?.filter((s) => s.category === 'technical')
            .map((s) => s.name) || [],
        business:
          skills?.filter((s) => s.category === 'business').map((s) => s.name) ||
          [],
        languages:
          skills
            ?.filter((s) => s.category === 'language')
            .map((s) => ({ name: s.name, level: s.level || '' })) || [],
      },
      targetRole: profileData.target_role,
      targetSalary: profileData.target_salary,
      availability: profileData.availability,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };

    // Génère le CV
    const result = await CVGeneratorService.generateCV(
      userProfile,
      jobAnalysis as JobAnalysis,
      variant,
      optimizationLevel || 'optimized'
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-cv:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate CV',
      },
      { status: 500 }
    );
  }
}
