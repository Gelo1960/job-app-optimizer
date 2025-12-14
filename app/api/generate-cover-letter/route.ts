import { NextRequest, NextResponse } from "next/server";
import { CoverLetterService } from "@/lib/services/cover-letter.service";
import { CoverLetterRequest, UserProfile } from "@/lib/types";
import { ProfileService } from "@/lib/services/profile.service";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        // Get authenticated user
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
            {
                global: {
                    headers: {
                        Authorization: req.headers.get('Authorization') || '',
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { jobAnalysis, companyInfo, tone } = body as CoverLetterRequest;

        if (!jobAnalysis || !companyInfo) {
            return NextResponse.json(
                { error: "Missing required fields: jobAnalysis, companyInfo" },
                { status: 400 }
            );
        }

        // 1. Fetch full user profile (needed for deep personalization)
        // using existing ProfileService to get data from Supabase
        const { data: userProfile, error } = await ProfileService.getFullProfile(user.id);

        if (error || !userProfile) {
            return NextResponse.json(
                { error: "User profile not found" },
                { status: 404 }
            );
        }

        // 2. Generate Cover Letter with user's API keys
        const content = await CoverLetterService.generate(
            { userProfileId: user.id, jobAnalysis, companyInfo, tone },
            userProfile,
            user.id  // Pass userId for API key lookup
        );

        // 3. Return structured content
        return NextResponse.json({
            success: true,
            data: content,
            formattedHtml: CoverLetterService.formatAsHtml(content)
        });

    } catch (error) {
        console.error("[API] Generate Cover Letter Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown" },
            { status: 500 }
        );
    }
}
