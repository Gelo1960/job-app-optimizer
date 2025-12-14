
import { NextRequest, NextResponse } from "next/server";
import { CoverLetterService } from "@/lib/services/cover-letter.service";
import { CoverLetterRequest, UserProfile } from "@/lib/types";
import { ProfileService } from "@/lib/services/profile.service";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userProfileId, jobAnalysis, companyInfo, tone } = body as CoverLetterRequest;

        if (!userProfileId || !jobAnalysis || !companyInfo) {
            return NextResponse.json(
                { error: "Missing required fields: userProfileId, jobAnalysis, companyInfo" },
                { status: 400 }
            );
        }

        // 1. Fetch full user profile (needed for deep personalization)
        // using existing ProfileService to get data from Supabase
        const { data: userProfile, error } = await ProfileService.getFullProfile(userProfileId);

        if (error || !userProfile) {
            return NextResponse.json(
                { error: "User profile not found" },
                { status: 404 }
            );
        }

        // 2. Generate Cover Letter
        const content = await CoverLetterService.generate(
            { userProfileId, jobAnalysis, companyInfo, tone },
            userProfile
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
