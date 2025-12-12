"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { JobAnalysis, CompanyEnrichment, GhostJobDetection } from "@/lib/types";
import { CompanyInfoCard } from "@/components/dashboard/CompanyInfoCard";
import { GhostJobWarning } from "@/components/dashboard/GhostJobWarning";
import Link from "next/link";

export default function AnalyzePage() {
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [companyData, setCompanyData] = useState<CompanyEnrichment | null>(null);
  const [ghostJobDetection, setGhostJobDetection] = useState<GhostJobDetection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);

  async function handleAnalyze() {
    if (!jobText || jobText.length < 100) {
      setError("Le texte de l'offre doit contenir au moins 100 caractères");
      return;
    }

    setLoading(true);
    setError(null);
    setCompanyData(null);
    setGhostJobDetection(null);

    try {
      // 1. Analyser l'offre d'emploi
      const res = await fetch("/api/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobText, jobUrl }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de l'analyse");
      }

      setAnalysis(data.data);

      // 2. Lancer l'enrichissement et la détection ghost job en parallèle (en arrière-plan)
      if (data.data) {
        setEnrichmentLoading(true);

        // Enrichissement et détection en parallèle
        Promise.all([
          // Détection ghost job (qui inclut l'enrichissement)
          fetch("/api/detect-ghost-job", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobAnalysis: data.data,
              companyName: companyName || undefined,
              jobUrl: jobUrl || undefined,
            }),
          }).then(r => r.json()),
        ]).then(([ghostData]) => {
          if (ghostData.success) {
            setGhostJobDetection(ghostData.data);
            if (ghostData.companyData) {
              setCompanyData(ghostData.companyData);
            }
          }
        }).catch(err => {
          console.error("Error in background enrichment:", err);
          // Non-bloquant: on continue même si ça échoue
        }).finally(() => {
          setEnrichmentLoading(false);
        });
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analyser une offre d'emploi</h1>
        <p className="text-gray-600 mt-2">
          Collez le texte d'une offre d'emploi pour extraire les mots-clés et obtenir des insights
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Texte de l'offre</CardTitle>
          <CardDescription>
            Copiez-collez le texte complet de l'offre d'emploi ci-dessous
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nom de l'entreprise (optionnel)
              </label>
              <Input
                placeholder="Ex: Google, Stripe, Airbnb..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Pour enrichir les données et détecter les ghost jobs
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                URL de l'offre (optionnel)
              </label>
              <Input
                placeholder="https://example.com/job-posting"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Aide à détecter les offres repostées
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Texte de l'offre *
            </label>
            <Textarea
              placeholder="Collez le texte de l'offre d'emploi ici...

Exemple:
Nous recherchons un Développeur Full-Stack React Native expérimenté pour rejoindre notre startup en hyper-croissance. Vous développerez des applications mobiles innovantes avec TypeScript, Redux et Firebase.

Compétences requises:
- React Native
- TypeScript
- Node.js
- PostgreSQL
..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
            <p className="text-sm text-gray-500 mt-2">
              {jobText.length} caractères (minimum 100)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={loading || jobText.length < 100}
            className="w-full"
            size="lg"
          >
            {loading ? "Analyse en cours..." : "Analyser l'offre"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Loading enrichment indicator */}
          {enrichmentLoading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
              <span className="text-sm">Enrichissement des données et détection ghost job en cours...</span>
            </div>
          )}

          {/* Ghost Job Warning - Show first if detected */}
          {ghostJobDetection && (
            <GhostJobWarning detection={ghostJobDetection} />
          )}

          {/* Company Info Card */}
          {companyData && (
            <CompanyInfoCard companyData={companyData} />
          )}

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Niveau de séniorité</CardDescription>
                <CardTitle className="text-2xl capitalize">{analysis.seniorityLevel}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Type d'entreprise</CardDescription>
                <CardTitle className="text-2xl capitalize">{analysis.companyType}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Score de formalisme</CardDescription>
                <CardTitle className="text-2xl">{analysis.formalityScore}/10</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Système ATS</CardDescription>
                <CardTitle className="text-xl capitalize">{analysis.atsSystemGuess}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle>Mots-clés techniques</CardTitle>
              <CardDescription>
                Ces mots-clés doivent apparaître dans votre CV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.technical.map((keyword, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compétences business</CardTitle>
              <CardDescription>
                Soft skills et compétences transversales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.business.map((keyword, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outils et technologies</CardTitle>
              <CardDescription>
                Outils spécifiques mentionnés dans l'offre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.tools.map((keyword, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Problems to Solve */}
          {analysis.problemsToSolve && analysis.problemsToSolve.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Problèmes à résoudre</CardTitle>
                <CardDescription>
                  Pain points identifiés dans l'offre
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.problemsToSolve.map((problem, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{problem}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Prochaine étape</CardTitle>
              <CardDescription className="text-blue-800">
                Utilisez cette analyse pour générer un CV optimisé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/generate">
                <Button size="lg" className="w-full">
                  Générer un CV optimisé →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
