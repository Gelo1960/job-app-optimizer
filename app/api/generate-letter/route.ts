import { NextRequest, NextResponse } from 'next/server';
import { CoverLetterGeneratorService } from '@/lib/services/cover-letter-generator.service';
import { getAuthenticatedClient } from '@/lib/db/server-actions';
import { UserProfile, JobAnalysis } from '@/lib/types';

/**
 * POST /api/generate-letter
 * Génère une lettre de motivation personnalisée pour une offre d'emploi
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getAuthenticatedClient();
    const body = await request.json();
    const { userProfileId, jobAnalysis, optimizationLevel } = body;

    // Validation des inputs
    if (!userProfileId || !jobAnalysis) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: userProfileId and jobAnalysis are required'
        },
        { status: 400 }
      );
    }

    // Validation du niveau d'optimisation
    const validLevels = ['safe', 'optimized', 'maximized'];
    const level = optimizationLevel || 'optimized';
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid optimizationLevel. Must be one of: ${validLevels.join(', ')}`
        },
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
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        {
          success: false,
          error: 'User profile not found'
        },
        { status: 404 }
      );
    }

    // Récupère les données liées (projets, expériences, éducation, compétences)
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
        .order('display_order', { ascending: true}),

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
      projects: (projects || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        tech: p.tech || [],
        url: p.url,
        appStoreUrl: p.app_store_url,
        githubUrl: p.github_url,
        kpis: p.kpis || [],
        startDate: p.start_date,
        endDate: p.end_date,
        highlights: p.highlights || [],
      })),
      experiences: (experiences || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        titleNormalized: e.title_normalized,
        company: e.company,
        location: e.location,
        startDate: e.start_date,
        endDate: e.end_date,
        dateFormat: e.date_format,
        description: e.description,
        achievements: e.achievements || [],
        tech: e.tech || [],
        riskLevel: e.risk_level,
      })),
      education: (education || []).map((edu: any) => ({
        id: edu.id,
        degree: edu.degree,
        institution: edu.institution,
        field: edu.field,
        startDate: edu.start_date,
        endDate: edu.end_date,
        location: edu.location,
        highlights: edu.highlights || [],
      })),
      skills: {
        technical:
          skills
            ?.filter((s: any) => s.category === 'technical')
            .map((s: any) => s.name) || [],
        business:
          skills
            ?.filter((s: any) => s.category === 'business')
            .map((s: any) => s.name) || [],
        languages:
          skills
            ?.filter((s: any) => s.category === 'language')
            .map((s: any) => ({ name: s.name, level: s.level || '' })) || [],
      },
      targetRole: profileData.target_role,
      targetSalary: profileData.target_salary,
      availability: profileData.availability,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };

    console.log('→ Generating cover letter for user:', userProfile.email);

    // Génère la lettre de motivation
    const coverLetter = await CoverLetterGeneratorService.generateCoverLetter(
      userProfile,
      jobAnalysis as JobAnalysis,
      level as 'safe' | 'optimized' | 'maximized'
    );

    // Calcule le score de qualité
    const score = CoverLetterGeneratorService.calculateCoverLetterScore(
      coverLetter,
      jobAnalysis as JobAnalysis
    );

    console.log('→ Cover letter generated successfully. Score:', score.overallScore);

    // Retourne la lettre et le score
    return NextResponse.json({
      success: true,
      data: {
        coverLetter,
        score,
        wordCount: CoverLetterGeneratorService.convertCoverLetterToText(coverLetter)
          .split(/\s+/)
          .length,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/generate-letter:', error);

    // Gestion d'erreurs spécifiques
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration error: Missing or invalid API key',
        },
        { status: 500 }
      );
    }

    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again in a few moments.',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate cover letter',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
