"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CVPreview } from "@/components/preview/CVPreview";
import { ATSScoreCard } from "@/components/preview/ATSScoreCard";
import { RiskAssessmentCard } from "@/components/preview/RiskAssessmentCard";
import { CoverLetterPreview } from "@/components/preview/CoverLetterPreview";
import { CoverLetterScoreCard } from "@/components/preview/CoverLetterScoreCard";
import { CVGenerationResult } from "@/lib/types";
import { CVGeneratorService } from "@/lib/services/cv-generator.service";
import { CoverLetter, CoverLetterScore, CoverLetterGeneratorService } from "@/lib/services/cover-letter-generator.service";

type Variant = "mobile_developer" | "product_developer" | "project_manager";
type OptimizationLevel = "safe" | "optimized" | "maximized";
type TabType = "cv" | "letter";

const variants = [
  {
    id: "mobile_developer" as Variant,
    name: "Développeur Mobile",
    description: "Focus React Native et développement mobile",
    icon: "📱",
  },
  {
    id: "product_developer" as Variant,
    name: "Développeur Produit",
    description: "Profil hybride tech/business",
    icon: "💼",
  },
  {
    id: "project_manager" as Variant,
    name: "Chef de Projet",
    description: "Leadership et vision produit",
    icon: "👔",
  },
];

const levels = [
  {
    id: "safe" as OptimizationLevel,
    name: "Safe",
    description: "Factuel strict - Zone verte uniquement",
    badge: "✅",
    color: "bg-green-50 border-green-200",
  },
  {
    id: "optimized" as OptimizationLevel,
    name: "Optimisé",
    description: "Reformulation professionnelle - Recommandé",
    badge: "⭐",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "maximized" as OptimizationLevel,
    name: "Maximisé",
    description: "Embellissement mesuré - Zone jaune",
    badge: "⚠️",
    color: "bg-orange-50 border-orange-200",
  },
];

export default function GeneratePage() {
  const [activeTab, setActiveTab] = useState<TabType>("cv");
  const [selectedVariant, setSelectedVariant] = useState<Variant>("mobile_developer");
  const [selectedLevel, setSelectedLevel] = useState<OptimizationLevel>("optimized");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CVGenerationResult | null>(null);
  const [letterResult, setLetterResult] = useState<{ coverLetter: CoverLetter; score: CoverLetterScore; wordCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      // Mock job analysis pour demo
      const mockJobAnalysis = {
        keywords: {
          technical: ["React Native", "TypeScript", "Node.js", "PostgreSQL"],
          business: ["autonomie", "communication", "travail d'équipe"],
          tools: ["Git", "Docker", "CI/CD"],
          certifications: [],
        },
        keywordContext: [],
        formalityScore: 6,
        seniorityLevel: "mid" as const,
        companyType: "startup" as const,
        problemsToSolve: ["Scalabilité", "Performance"],
        atsSystemGuess: "greenhouse" as const,
      };

      // Mock user profile pour demo
      const mockUserProfile = {
        id: "demo-user",
        firstName: "Ange",
        lastName: "Yaokouassi",
        email: "ange@example.com",
        phone: "+33 6 12 34 56 78",
        location: "Paris, France",
        linkedinUrl: "https://linkedin.com/in/ange",
        githubUrl: "https://github.com/ange",
        portfolioUrl: "https://ange-portfolio.com",
        profileVariants: {
          mobile_developer: {
            name: "Mobile Developer",
            targetRole: "Développeur Mobile React Native",
            professionalSummary: "Développeur Full-Stack Mobile",
            skillsOrder: [],
            experiencesOrder: [],
            sectionsOrder: ["summary", "skills", "projects", "experience", "education"],
          },
          product_developer: {
            name: "Product Developer",
            targetRole: "Développeur Produit",
            professionalSummary: "Développeur avec vision produit",
            skillsOrder: [],
            experiencesOrder: [],
            sectionsOrder: ["summary", "skills", "experience", "projects", "education"],
          },
          project_manager: {
            name: "Project Manager",
            targetRole: "Chef de Projet Digital",
            professionalSummary: "Chef de projet avec expertise technique",
            skillsOrder: [],
            experiencesOrder: [],
            sectionsOrder: ["summary", "experience", "skills", "projects", "education"],
          },
        },
        projects: [
          {
            id: "1",
            name: "Summer Dating",
            description: "Application de rencontres iOS",
            status: "live" as const,
            tech: ["React Native", "Firebase", "Redux"],
            appStoreUrl: "https://apps.apple.com/summer-dating",
            startDate: "2023-06",
            highlights: [
              "Publié sur l'App Store avec résolution des problématiques iPad compatibility",
              "Architecture scalable avec gestion d'état Redux",
              "+1000 téléchargements",
            ],
          },
          {
            id: "2",
            name: "Mindful Gut",
            description: "Application santé digestive avec gamification",
            status: "development" as const,
            tech: ["React Native", "TypeScript", "Supabase"],
            startDate: "2024-01",
            highlights: [
              "Concept innovant de 'Safe Watching' pour la santé digestive",
              "Système de gamification pour engagement utilisateur",
            ],
          },
        ],
        experiences: [
          {
            id: "1",
            title: "Développeur Freelance",
            company: "Projets Personnels",
            startDate: "2023-01",
            dateFormat: "year-only" as const,
            description: "Développement d'applications mobiles et web",
            achievements: [
              "Développé 3 applications mobiles React Native",
              "Livré 7 projets web pour clients B2B",
              "Stack: React Native, React, Node.js, PostgreSQL, Firebase",
            ],
            riskLevel: "LOW" as const,
          },
        ],
        education: [
          {
            id: "1",
            degree: "Master Marketing & Communication",
            institution: "Université",
            field: "Marketing Digital",
            startDate: "2020-09",
            endDate: "2022-06",
          },
          {
            id: "2",
            degree: "Bachelor Finance",
            institution: "École de Commerce",
            field: "Finance d'Entreprise",
            startDate: "2017-09",
            endDate: "2020-06",
          },
        ],
        skills: {
          technical: ["React Native", "TypeScript", "JavaScript", "Node.js", "PostgreSQL", "Firebase", "Git"],
          business: ["Marketing Digital", "Gestion de projet", "Communication"],
          languages: [
            { name: "Français", level: "Natif" },
            { name: "Anglais", level: "Courant (C1)" },
          ],
        },
        targetRole: "Développeur Full-Stack Mobile",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfileId: mockUserProfile.id,
          jobAnalysis: mockJobAnalysis,
          variant: selectedVariant,
          optimizationLevel: selectedLevel,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la génération");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      console.error("Generation error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateLetter() {
    setLoading(true);
    setError(null);

    try {
      // Mock job analysis pour demo
      const mockJobAnalysis = {
        keywords: {
          technical: ["React Native", "TypeScript", "Node.js", "PostgreSQL"],
          business: ["autonomie", "communication", "travail d'équipe"],
          tools: ["Git", "Docker", "CI/CD"],
          certifications: [],
        },
        keywordContext: [],
        formalityScore: 6,
        seniorityLevel: "mid" as const,
        companyType: "startup" as const,
        problemsToSolve: ["Scalabilité", "Performance"],
        atsSystemGuess: "greenhouse" as const,
      };

      // Mock user profile ID
      const mockUserProfileId = "demo-user";

      const res = await fetch("/api/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfileId: mockUserProfileId,
          jobAnalysis: mockJobAnalysis,
          optimizationLevel: selectedLevel,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la génération");
      }

      setLetterResult(data.data);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      console.error("Generation error:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleExportText() {
    if (!result) return;
    const text = CVGeneratorService.cvContentToText(result.content);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv.txt";
    a.click();
  }

  function handleExportLetter() {
    if (!letterResult) return;
    const text = CoverLetterGeneratorService.convertCoverLetterToText(letterResult.coverLetter);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lettre-motivation.txt";
    a.click();
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Générer vos documents</h1>
        <p className="text-gray-600 mt-2">
          Créez un CV et une lettre de motivation optimisés pour une offre d'emploi spécifique
        </p>
      </div>

      {/* Onglets CV / Lettre de motivation */}
      <div className="flex gap-4 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab("cv")}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === "cv"
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          CV
          {activeTab === "cv" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("letter")}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === "letter"
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Lettre de Motivation
          {activeTab === "letter" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>

      {/* Contenu CV */}
      {activeTab === "cv" && !result && (
        <>
          {/* Étape 1: Sélection variante */}
          <Card>
            <CardHeader>
              <CardTitle>Étape 1: Choisissez votre variante de profil</CardTitle>
              <CardDescription>
                Sélectionnez la variante qui correspond le mieux au poste visé
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant.id)}
                  className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                    selectedVariant === variant.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-4xl mb-3">{variant.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{variant.name}</h3>
                  <p className="text-sm text-gray-600">{variant.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Étape 2: Niveau d'optimisation */}
          <Card>
            <CardHeader>
              <CardTitle>Étape 2: Niveau d'optimisation</CardTitle>
              <CardDescription>
                Choisissez le niveau de reformulation souhaité
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                    selectedLevel === level.id
                      ? `border-blue-600 ${level.color}`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{level.badge}</div>
                  <h3 className="font-semibold text-lg mb-2">{level.name}</h3>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Bouton génération */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">Prêt à générer votre CV ?</p>
                  <p className="text-sm text-gray-600">
                    Variante: <strong>{variants.find((v) => v.id === selectedVariant)?.name}</strong>
                    {" · "}
                    Niveau: <strong>{levels.find((l) => l.id === selectedLevel)?.name}</strong>
                  </p>
                </div>
                <Button onClick={handleGenerate} disabled={loading} size="lg">
                  {loading ? "Génération en cours..." : "Générer le CV"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Résultats CV */}
      {activeTab === "cv" && result && (
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Votre CV est prêt !</h3>
                  <p className="text-sm text-gray-600">
                    Exportez-le ou générez une nouvelle version
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setResult(null)}>
                    Nouvelle version
                  </Button>
                  <Button variant="secondary" onClick={handleExportText}>
                    Exporter (Texte)
                  </Button>
                  <Button disabled>
                    Exporter PDF (Bientôt)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scores */}
          <div className="grid md:grid-cols-2 gap-6">
            <ATSScoreCard score={result.atsScore} />
            <RiskAssessmentCard assessment={result.riskAssessment} />
          </div>

          {/* Preview CV */}
          <CVPreview content={result.content} />
        </div>
      )}

      {/* Contenu Lettre de Motivation */}
      {activeTab === "letter" && !letterResult && (
        <>
          {/* Niveau d'optimisation */}
          <Card>
            <CardHeader>
              <CardTitle>Niveau d'optimisation</CardTitle>
              <CardDescription>
                Choisissez le niveau de personnalisation souhaité pour votre lettre
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                    selectedLevel === level.id
                      ? `border-blue-600 ${level.color}`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{level.badge}</div>
                  <h3 className="font-semibold text-lg mb-2">{level.name}</h3>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Informations sur la lettre */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">À propos de votre lettre de motivation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>✅ <strong>Hook captivant</strong> - Pas de clichés "Je vous écris pour..."</p>
              <p>✅ <strong>Preuves concrètes</strong> - Exemples chiffrés de vos réalisations</p>
              <p>✅ <strong>Personnalisation</strong> - Recherche spécifique sur l'entreprise</p>
              <p>✅ <strong>300-400 mots</strong> - Format optimal pour être lue en entier</p>
              <p>✅ <strong>Call to Action</strong> - Proposition concrète de prochaine étape</p>
            </CardContent>
          </Card>

          {/* Bouton génération */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">Prêt à générer votre lettre de motivation ?</p>
                  <p className="text-sm text-gray-600">
                    Niveau: <strong>{levels.find((l) => l.id === selectedLevel)?.name}</strong>
                  </p>
                </div>
                <Button onClick={handleGenerateLetter} disabled={loading} size="lg">
                  {loading ? "Génération en cours..." : "Générer la lettre"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Résultats Lettre de Motivation */}
      {activeTab === "letter" && letterResult && (
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Votre lettre de motivation est prête !</h3>
                  <p className="text-sm text-gray-600">
                    Exportez-la ou générez une nouvelle version
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setLetterResult(null)}>
                    Nouvelle version
                  </Button>
                  <Button variant="secondary" onClick={handleExportLetter}>
                    Exporter (Texte)
                  </Button>
                  <Button disabled>
                    Exporter PDF (Bientôt)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score */}
          <CoverLetterScoreCard score={letterResult.score} />

          {/* Preview Lettre */}
          <CoverLetterPreview
            coverLetter={letterResult.coverLetter}
            wordCount={letterResult.wordCount}
          />
        </div>
      )}
    </div>
  );
}
