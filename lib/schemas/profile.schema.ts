
import { z } from "zod";

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const DateStringSchema = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, "Format invalide (YYYY-MM-DD ou YYYY-MM)");

export const RiskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

// ============================================================================
// IDENTITY & CONTACT
// ============================================================================

export const IdentitySchema = z.object({
    firstName: z.string().min(2, "Le prénom doit avoir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit avoir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(10, "Numéro de téléphone invalide").optional().or(z.literal("")),
    location: z.string().min(2, "La ville est requise"),
    targetRole: z.string().min(2, "Le poste visé est requis"),
    linkedinUrl: z.string().url("URL LinkedIn invalide").optional().or(z.literal("")),
    githubUrl: z.string().url("URL GitHub invalide").optional().or(z.literal("")),
    portfolioUrl: z.string().url("URL Portfolio invalide").optional().or(z.literal("")),
    availability: z.string().optional(),
});

export type IdentityFormValues = z.infer<typeof IdentitySchema>;

// ============================================================================
// EXPERIENCE
// ============================================================================

export const ExperienceSchema = z.object({
    title: z.string().min(2, "Le titre est requis"),
    company: z.string().min(2, "L'entreprise est requise"),
    location: z.string().optional(),
    startDate: DateStringSchema,
    endDate: DateStringSchema.optional().or(z.literal("")),
    current: z.boolean(), // Removed default(false) to enforce explicit boolean handling in form
    description: z.string().min(10, "La description est trop courte"),
    achievements: z.array(z.object({ value: z.string() })).min(1, "Au moins une réalisation est requise"),
    tech: z.array(z.string()).optional(),
});

export type ExperienceFormValues = z.infer<typeof ExperienceSchema>;

// ============================================================================
// EDUCATION
// ============================================================================

export const EducationSchema = z.object({
    degree: z.string().min(2, "Le diplôme est requis"),
    institution: z.string().min(2, "L'école/université est requise"),
    field: z.string().min(2, "Le domaine est requis"),
    startDate: DateStringSchema,
    endDate: DateStringSchema.optional().or(z.literal("")),
    current: z.boolean().default(false),
    location: z.string().optional(),
    highlights: z.array(z.object({ value: z.string() })).optional(),
});

export type EducationFormValues = z.infer<typeof EducationSchema>;

// ============================================================================
// PROJECTS
// ============================================================================

export const ProjectSchema = z.object({
    name: z.string().min(2, "Le nom du projet est requis"),
    description: z.string().min(10, "La description est trop courte"),
    status: z.enum(['live', 'development', 'completed', 'archived']),
    tech: z.array(z.string()).min(1, "Au moins une technologie est requise"),
    url: z.string().url().optional().or(z.literal("")),
    githubUrl: z.string().url().optional().or(z.literal("")),
    startDate: DateStringSchema,
    endDate: DateStringSchema.optional().or(z.literal("")),
    highlights: z.array(z.object({ value: z.string() })).min(1, "Au moins un point fort est requis"),
});

export type ProjectFormValues = z.infer<typeof ProjectSchema>;

// ============================================================================
// SKILLS
// ============================================================================

export const SkillsSchema = z.object({
    technical: z.array(z.object({ value: z.string() })).min(1, "Au moins une compétence technique requise"),
    business: z.array(z.object({ value: z.string() })).optional(),
    languages: z.array(z.object({
        name: z.string().min(2),
        level: z.string()
    })).optional(),
});

export type SkillsFormValues = z.infer<typeof SkillsSchema>;
