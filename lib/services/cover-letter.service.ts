import { CoverLetterContent, CoverLetterRequest, UserProfile } from "@/lib/types";
import { AIService } from "./ai.service";
import { COVER_LETTER_SYSTEM_PROMPT, generateCoverLetterPrompt } from "@/lib/prompts/cover-letter.prompt";

export class CoverLetterService {

  /**
   * Generates a tailored cover letter based on user profile, job, and company info.
   * @param userId - User ID for API key lookup
   */
  static async generate(request: CoverLetterRequest, userProfile: UserProfile, userId: string): Promise<CoverLetterContent> {
    const prompt = generateCoverLetterPrompt(
      userProfile,
      request.jobAnalysis,
      request.companyInfo,
      request.tone
    );

    try {
      const response = await AIService.sendPromptJSON<CoverLetterContent>(
        prompt,
        COVER_LETTER_SYSTEM_PROMPT,
        { userId }
      );

      return response;
    } catch (error) {
      console.error("Cover Letter Generation Error:", error);
      throw new Error("Failed to generate cover letter. Please try again.");
    }
  }

  /**
   * Converts the structured JSON content into a clean HTML format for preview/export.
   */
  static formatAsHtml(content: CoverLetterContent): string {
    return `
      <div class="cover-letter-preview font-sans text-gray-800 leading-relaxed max-w-prose mx-auto p-8 bg-white shadow-sm border">
        <p class="mb-6 font-semibold">${content.greeting}</p>
        
        <div class="space-y-4">
          <p>${content.hook}</p>
          <p>${content.credibility}</p>
          <p>${content.uniqueValue}</p>
          <p>${content.culturalFit}</p>
          <p class="font-medium text-blue-900">${content.cta}</p>
        </div>

        <p class="mt-8 border-t pt-4">
          ${content.signature}
        </p>
      </div>
    `;
  }
}
