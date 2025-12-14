"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { JobAnalysis, CompanyEnrichment, GhostJobDetection } from "@/lib/types";
import { CompanyInfoCard } from "@/components/dashboard/CompanyInfoCard";
import { GhostJobWarning } from "@/components/dashboard/GhostJobWarning";
import { X, ChevronLeft, ArrowRight } from "lucide-react";

interface AnalyzeOverlayProps {
    onClose: () => void;
    onGenerateClick: () => void;
}

export function AnalyzeOverlay({ onClose, onGenerateClick }: AnalyzeOverlayProps) {
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
        <div className="h-full flex flex-col bg-white/95 backdrop-blur-xl">
            {/* Header Mobile-like */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <button
                    onClick={onClose}
                    className="p-2 -ml-2 text-gray-500 hover:text-gray-900 flex items-center gap-1"
                >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="font-medium">Retour</span>
                </button>
                <span className="font-semibold text-gray-900">Analyser une offre</span>
                <div className="w-16"></div> {/* Spacer for centering */}
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="text-center py-6">
                        <h1 className="text-2xl font-bold tracking-tight mb-2">Comprendre votre cible</h1>
                        <p className="text-gray-500 text-sm">
                            Collez l'offre pour détecter les mots-clés cachés et les pièges.
                        </p>
                    </div>

                    {/* Input Form */}
                    <Card className="border-0 shadow-none bg-transparent">
                        <CardContent className="space-y-4 p-0">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium mb-1.5 block text-gray-700">
                                        Entreprise (Optionnel)
                                    </label>
                                    <Input
                                        placeholder="Ex: Google, Stripe..."
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="bg-gray-50 border-gray-100 rounded-xl focus:bg-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium mb-1.5 block text-gray-700">
                                        Lien (Optionnel)
                                    </label>
                                    <Input
                                        placeholder="https://..."
                                        value={jobUrl}
                                        onChange={(e) => setJobUrl(e.target.value)}
                                        className="bg-gray-50 border-gray-100 rounded-xl focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium mb-1.5 block text-gray-700">
                                    Description du poste *
                                </label>
                                <Textarea
                                    placeholder="Collez le texte complet de l'offre ici..."
                                    value={jobText}
                                    onChange={(e) => setJobText(e.target.value)}
                                    rows={10}
                                    className="font-mono text-sm bg-gray-50 border-gray-100 rounded-2xl focus:bg-white transition-colors resize-none p-4"
                                />
                                <p className="text-xs text-gray-400 mt-2 text-right">
                                    {jobText.length} caractères
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            {!analysis && (
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={loading || jobText.length < 100}
                                    className="w-full h-12 rounded-2xl bg-black text-white hover:bg-gray-800 text-base shadow-lg shadow-gray-200"
                                >
                                    {loading ? "Analyse en cours..." : "Lancer l'analyse"}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Results */}
                    {analysis && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
                            {/* Loading enrichment indicator */}
                            {enrichmentLoading && (
                                <div className="bg-blue-50/50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                                    <span>Recherche d'infos entreprise...</span>
                                </div>
                            )}

                            {/* Ghost Job Warning */}
                            {ghostJobDetection && (
                                <GhostJobWarning detection={ghostJobDetection} />
                            )}

                            {/* Company Info */}
                            {companyData && (
                                <CompanyInfoCard companyData={companyData} />
                            )}

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="text-xs text-gray-500 mb-1">Niveau</div>
                                    <div className="font-semibold capitalize">{analysis.seniorityLevel}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="text-xs text-gray-500 mb-1">Type</div>
                                    <div className="font-semibold capitalize">{analysis.companyType}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="text-xs text-gray-500 mb-1">Formalisme</div>
                                    <div className="font-semibold">{analysis.formalityScore}/10</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="text-xs text-gray-500 mb-1">ATS Probable</div>
                                    <div className="font-semibold capitalize">{analysis.atsSystemGuess}</div>
                                </div>
                            </div>

                            {/* Keywords */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm text-gray-900 border-b pb-2">Mots-clés Techniques</h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.keywords.technical.map((keyword, i) => (
                                        <span key={i} className="inline-flex px-3 py-1.5 rounded-xl text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Next Steps */}
                            <div className="fixed bottom-6 left-4 right-4 max-w-3xl mx-auto">
                                <Button
                                    onClick={onGenerateClick}
                                    size="lg"
                                    className="w-full h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 hover:scale-[1.02] transition-transform text-lg"
                                >
                                    Générer le CV optimisé <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
