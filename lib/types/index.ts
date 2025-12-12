// ============================================================================
// TYPES PRINCIPAUX DU SYSTÈME
// ============================================================================

export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
export type CompanyType = 'startup' | 'scaleup' | 'corporate' | 'agency';
export type ATSSystem = 'greenhouse' | 'lever' | 'workday' | 'taleo' | 'bamboohr' | 'unknown';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ApplicationStatus = 'pending' | 'sent' | 'response_positive' | 'response_negative' | 'no_response';

// ============================================================================
// ANALYSE D'OFFRE D'EMPLOI
// ============================================================================

export interface JobKeywords {
  technical: string[];
  business: string[];
  tools: string[];
  certifications: string[];
}

export interface KeywordContext {
  keyword: string;
  context: string;
  frequency: number;
  importance: number; // 0-1
}

export interface JobAnalysis {
  keywords: JobKeywords;
  keywordContext: KeywordContext[];
  formalityScore: number; // 1-10
  seniorityLevel: SeniorityLevel;
  companyType: CompanyType;
  problemsToSolve: string[];
  atsSystemGuess: ATSSystem;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  requiredYearsExperience?: number;
  remotePolicy?: 'onsite' | 'hybrid' | 'remote';
}

// ============================================================================
// PROFIL UTILISATEUR
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'live' | 'development' | 'completed' | 'archived';
  tech: string[];
  url?: string;
  appStoreUrl?: string;
  githubUrl?: string;
  kpis?: string[];
  startDate: string;
  endDate?: string;
  highlights: string[];
}

export interface Experience {
  id: string;
  title: string;
  titleNormalized?: string; // Titre "marketé"
  company: string;
  location?: string;
  startDate: string;
  endDate?: string | 'present';
  dateFormat: 'full' | 'year-only'; // Pour masquer les gaps
  description: string;
  achievements: string[];
  tech?: string[];
  riskLevel: RiskLevel;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  field: string;
  startDate: string;
  endDate: string;
  location?: string;
  highlights?: string[];
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;

  // Profils multiples
  profileVariants: {
    mobile_developer: ProfileVariant;
    product_developer: ProfileVariant;
    project_manager: ProfileVariant;
  };

  // Données brutes
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  skills: {
    technical: string[];
    business: string[];
    languages: { name: string; level: string }[];
  };

  // Méta
  targetRole: string;
  targetSalary?: number;
  availability?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileVariant {
  name: string;
  targetRole: string;
  professionalSummary: string;
  skillsOrder: string[]; // IDs des skills à mettre en avant
  experiencesOrder: string[]; // IDs des expériences dans l'ordre
  sectionsOrder: ('summary' | 'skills' | 'projects' | 'experience' | 'education')[];
}

// ============================================================================
// GÉNÉRATION DE CV
// ============================================================================

export interface CVGenerationRequest {
  userProfileId: string;
  variantType: keyof UserProfile['profileVariants'];
  jobAnalysis: JobAnalysis;
  optimizationLevel: 'safe' | 'optimized' | 'maximized';
}

export interface CVContent {
  header: {
    name: string;
    title: string;
    contact: string[];
  };
  professionalSummary: string;
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    title: string;
    company: string;
    period: string;
    bullets: string[];
  }[];
  projects?: {
    name: string;
    description: string;
    tech: string[];
    highlights: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    period: string;
  }[];
  additional?: {
    section: string;
    content: string;
  }[];
}

export interface CVGenerationResult {
  content: CVContent;
  atsScore: ATSScore;
  riskAssessment: RiskAssessment;
  variants: {
    safe: CVContent;
    optimized: CVContent;
    maximized?: CVContent;
  };
}

export interface ATSScore {
  overallScore: number; // 0-100
  breakdown: {
    formatParsable: number;
    keywordMatch: number;
    structureStandard: number;
    dateFormat: number;
    chronologyConsistent: number;
  };
  passThreshold: number; // Usually 70
  willPass: boolean;
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  flags: {
    statement: string;
    riskLevel: RiskLevel;
    reason: string;
    recommendation: string;
  }[];
}

// ============================================================================
// GÉNÉRATION DE LETTRE DE MOTIVATION
// ============================================================================

export interface CoverLetterRequest {
  userProfileId: string;
  jobAnalysis: JobAnalysis;
  companyInfo: CompanyEnrichment;
  tone: 'formal' | 'professional' | 'conversational';
}

export interface CoverLetterContent {
  greeting: string;
  hook: string; // Paragraphe 1: Pain point
  credibility: string; // Paragraphe 2: Preuves
  uniqueValue: string; // Paragraphe 3: Profil hybride
  culturalFit: string; // Paragraphe 4: Recherche entreprise
  cta: string; // Paragraphe 5: Appel à l'action
  signature: string;
}

// ============================================================================
// ENRICHISSEMENT ENTREPRISE
// ============================================================================

export interface CompanyEnrichment {
  companyName: string;
  website?: string;
  linkedinUrl?: string;
  recentAchievements: string[];
  painPoints: string[];
  cultureKeywords: string[];
  notableProducts: string[];
  recentNews: {
    title: string;
    date: string;
    source: string;
  }[];
  employeeCount?: number;
  funding?: string;
}

// ============================================================================
// RECHERCHE DE CONTACTS
// ============================================================================

export interface Contact {
  name: string;
  title: string;
  email?: string;
  linkedinUrl?: string;
  confidence: number; // 0-1
}

export interface ContactSearchResult {
  hiringManager?: Contact;
  teamLead?: Contact;
  hrContact?: Contact;
  alternativeContacts: Contact[];
}

// ============================================================================
// DÉTECTION GHOST JOBS
// ============================================================================

export interface GhostJobAnalysis {
  isGhostJob: boolean;
  confidence: number; // 0-1
  redFlags: {
    ageInDays?: number;
    repostCount?: number;
    vagueness?: number;
    noSalary?: boolean;
    genericPhrases?: string[];
  };
  recommendation: 'APPLY' | 'SKIP' | 'CAUTIOUS';
  reasoning: string;
}

export type GhostJobRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface GhostJobSignal {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  points: number;
}

export interface GhostJobDetection {
  score: number; // 0-100, plus c'est haut plus c'est suspect
  riskLevel: GhostJobRiskLevel;
  signals: GhostJobSignal[];
  recommendation: 'APPLY' | 'APPLY_WITH_CAUTION' | 'SKIP';
  reasoning: string;
  confidenceLevel: number; // 0-1
}

// ============================================================================
// A/B TESTING & ANALYTICS
// ============================================================================

export interface Application {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  cvVariant: string;
  letterVariant?: string;
  channel: 'linkedin' | 'direct_email' | 'company_website' | 'other';
  status: ApplicationStatus;
  responseDate?: string;
  notes?: string;
}

export interface ABTestResult {
  variant: string;
  totalApplications: number;
  responses: number;
  responseRate: number;
  avgDaysToResponse: number;
}

// ============================================================================
// COLD EMAIL
// ============================================================================

export interface ColdEmailTemplate {
  subject: string;
  body: string;
  personalization: {
    companyResearch: string;
    relevantProject: string;
    specificValue: string;
  };
}

export type EmailTone = 'formal' | 'friendly' | 'direct';

export interface EmailVariant {
  subject: string;
  bodyHtml: string;
  bodyPlainText: string;
  tone: EmailTone;
}

export interface ColdEmail {
  id: string;
  variants: {
    formal: EmailVariant;
    friendly: EmailVariant;
    direct: EmailVariant;
  };
  recipientInfo?: Contact;
  qualityScore: number; // 0-100
  generatedAt: string;
  metadata: {
    jobTitle?: string;
    company?: string;
    userProfileId: string;
  };
}
