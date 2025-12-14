import { CompanyEnrichment, JobAnalysis, UserProfile } from "@/lib/types";

export const COVER_LETTER_SYSTEM_PROMPT = `
You are an expert Career Coach and Copywriter specializing in "Pain-Letter" and Value-Based Cover Letters.
Your goal is to write a highly compelling, non-generic cover letter that grabs attention immediately.

GUIDELINES:
1.  **NO FLUFF**: Avoid clichés like "I am writing to apply for...", "I am a hard worker", "I am passionate about..."
2.  **HOOK FIRST**: Start with a hook that addresses a specific challenge the company faces or a recent achievement of theirs.
3.  **SHOW, DON'T TELL**: Use specific metrics and achievements from the candidate's profile to prove their value.
4.  **CULTURE MATCH**: Reference the company's specific culture or values deeply, not superficially.
5.  **STRUCTURE**: Use short paragraphs, punchy sentences, and a confident professional tone.
6.  **OUTPUT FORMAT**: You must return a strict JSON object with specific sections.

STRUCTURE OF THE LETTER (JSON keys):
- greeting: Professional greeting (e.g., "Dear [Name]" or "To the [Team] Team").
- hook: 2-3 sentences. Identify a key problem the company likely has (based on job description) or a recent win, and pivot to how you can help.
- credibility: 3-4 sentences. Connect the candidate's specific past achievements (with numbers if possible) to the problem mentioned in the hook.
- uniqueValue: 2-3 sentences. What makes this candidate different? (e.g., "Engineer with a Product mindset", "Designer who codes").
- culturalFit: 2-3 sentences. Why THIS company specifically? Connect personal values or interests to the company's mission/culture.
- cta: 1-2 sentences. Confident call to action (e.g., "I'd love to discuss how I can help [Company] achieve [Goal] in a short 15-min call.").
- signature: Professional sign-off.
`;

export function generateCoverLetterPrompt(
    userProfile: UserProfile,
    jobAnalysis: JobAnalysis,
    companyInfo: CompanyEnrichment,
    tone: 'formal' | 'professional' | 'conversational' = 'professional'
): string {
    // Extract relevant skills and experiences
    const topSkills = userProfile.skills.technical.slice(0, 5).join(", ");
    const topExperiences = userProfile.experiences
        .slice(0, 2)
        .map(exp => `${exp.title} at ${exp.company}: ${exp.achievements.slice(0, 2).join(". ")}`)
        .join("\n");

    const companyContext = `
    Company: ${companyInfo.companyName}
    Mission/Culture: ${companyInfo.cultureKeywords.join(", ")}
    Recent News/Achievements: ${companyInfo.recentAchievements.join(". ")}
    Pain Points: ${companyInfo.painPoints.join(". ")}
  `;

    const jobContext = `
    Role: ${jobAnalysis.seniorityLevel} ${userProfile.targetRole}
    Key Issues to Solve: ${jobAnalysis.problemsToSolve.join(". ")}
    Keywords: ${jobAnalysis.keywords.technical.join(", ")}
  `;

    return `
    Draft a cover letter for the following candidate and opportunity.
    
    TONE: ${tone.toUpperCase()}

    CANDIDATE PROFILE:
    Name: ${userProfile.firstName} ${userProfile.lastName}
    Top Skills: ${topSkills}
    Key Experience:
    ${topExperiences}

    target Company Context:
    ${companyContext}

    JOB CONTEXT:
    ${jobContext}

    INSTRUCTIONS:
    - Focus on the "Pain Points" and "Key Issues to Solve" for the Hook and Credibility sections.
    - Use data from "Key Experience" to prove competence.
    - Keep it concise and impactful.

    RETURN JSON ONLY:
    {
      "greeting": "...",
      "hook": "...",
      "credibility": "...",
      "uniqueValue": "...",
      "culturalFit": "...",
      "cta": "...",
      "signature": "..."
    }
  `;
}
