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
import { CVFormatterUtils } from "@/lib/utils/cv-formatter";
import { CoverLetter, CoverLetterScore } from "@/lib/services/cover-letter-generator.service";
import { CoverLetterFormatterUtils } from "@/lib/utils/cover-letter-formatter";
import { ChevronLeft, Download, FileText, Sparkles, RefreshCcw } from "lucide-react";

type Variant = "mobile_developer" | "product_developer" | "project_manager";
type OptimizationLevel = "safe" | "optimized" | "maximized";
type TabType = "cv" | "letter";

interface GenerateOverlayProps {
    onClose: () => void;
    // Optional: pass analysis data from the analyze step if available
    prefilledAnalysis?: any;
}

const variants = [
    { id: "mobile_developer", name: "Mobile Dev", icon: "📱", color: "bg-blue-50 text-blue-600 border-blue-200" },
    { id: "product_developer", name: "Product Dev", icon: "💼", color: "bg-purple-50 text-purple-600 border-purple-200" },
    { id: "project_manager", name: "Project Lead", icon: "👔", color: "bg-orange-50 text-orange-600 border-orange-200" },
];

const levels = [
    { id: "safe", name: "Safe", icon: "🛡️" },
    { id: "optimized", name: "Optimized", icon: "⭐" },
    { id: "maximized", name: "Bold", icon: "🚀" },
];

export function GenerateOverlay({ onClose, prefilledAnalysis }: GenerateOverlayProps) {
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
            // Mock data usage for demo stability
            const mockJobAnalysis = prefilledAnalysis || {
                keywords: {
                    technical: ["React Native", "TypeScript", "Node.js"],
                    business: ["Leadership", "Agile"],
                    tools: ["Git", "Jira"],
                    certifications: [],
                },
                keywordContext: [],
                formalityScore: 7,
                seniorityLevel: "senior",
                companyType: "scaleup",
                problemsToSolve: ["Retention", "Performance"],
                atsSystemGuess: "lever",
            };

            const mockUserProfile = {
                id: "demo-user",
                firstName: "Ange",
                lastName: "Yaokouassi",
                email: "ange@example.com",
                phone: "+33 6 12 34 56 78",
                location: "Paris, France",
                linkedinUrl: "linkedin.com/in/ange",
                githubUrl: "github.com/ange",
                portfolioUrl: "ange.dev",
                profileVariants: {
                    mobile_developer: {
                        name: "Mobile",
                        targetRole: "Lead Mobile Engineer",
                        professionalSummary: "Expert React Native",
                        skillsOrder: [], experiencesOrder: [], sectionsOrder: ["summary", "experience", "skills"]
                    },
                    product_developer: { name: "Product", targetRole: "Product Engineer", professionalSummary: "Product-minded dev", skillsOrder: [], experiencesOrder: [], sectionsOrder: [] },
                    project_manager: { name: "Manager", targetRole: "Engineering Manager", professionalSummary: "People manager", skillsOrder: [], experiencesOrder: [], sectionsOrder: [] }
                },
                projects: [], experiences: [], education: [], skills: { technical: [], business: [], languages: [] },
                targetRole: "Engineer", createdAt: "", updatedAt: ""
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
            if (!data.success) throw new Error(data.error || "Erreur de génération");
            setResult(data.data);
        } catch (err: any) {
            setError(err.message || "Erreur inattendue");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerateLetter() {
        setLoading(true);
        setError(null);
        try {
            const mockJobAnalysis = prefilledAnalysis || {
                keywords: { technical: [], business: [], tools: [], certifications: [] },
                keywordContext: [], formalityScore: 5, seniorityLevel: "mid", companyType: "generic", problemsToSolve: [], atsSystemGuess: "unknown"
            };
            const res = await fetch("/api/generate-letter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userProfileId: "demo-user",
                    jobAnalysis: mockJobAnalysis,
                    optimizationLevel: selectedLevel,
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setLetterResult(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function handleExportText(type: 'cv' | 'letter') {
        const content = type === 'cv' && result
            ? CVFormatterUtils.cvContentToText(result.content)
            : letterResult ? CoverLetterFormatterUtils.convertCoverLetterToText(letterResult.coverLetter) : "";

        if (!content) return;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
    }

    return (
        <div className="h-full flex flex-col bg-white/95 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 flex items-center gap-1">
                    <ChevronLeft className="h-5 w-5" />
                    <span className="font-medium">Retour</span>
                </button>

                {/* IOS-style Segmented Control */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("cv")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'cv' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                    >
                        CV
                    </button>
                    <button
                        onClick={() => setActiveTab("letter")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'letter' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                    >
                        Lettre
                    </button>
                </div>

                <div className="w-16"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* Generation Controls */}
                    {!((activeTab === 'cv' && result) || (activeTab === 'letter' && letterResult)) && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <div className="text-center py-4">
                                <h2 className="text-xl font-bold mb-2">Configuration</h2>
                                <p className="text-gray-500 text-sm">Personnalisez le contenu généré</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {variants.map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVariant(v.id as Variant)}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${selectedVariant === v.id ? v.color : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className="text-2xl mb-1">{v.icon}</div>
                                        <div className="font-bold text-xs">{v.name}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="bg-gray-50 p-1 rounded-xl flex gap-1">
                                {levels.map(l => (
                                    <button
                                        key={l.id}
                                        onClick={() => setSelectedLevel(l.id as OptimizationLevel)}
                                        className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-1 ${selectedLevel === l.id ? 'bg-white shadow-sm text-black ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <span className="text-base">{l.icon}</span>
                                        {l.name}
                                    </button>
                                ))}
                            </div>

                            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}

                            <Button
                                onClick={activeTab === 'cv' ? handleGenerate : handleGenerateLetter}
                                disabled={loading}
                                className="w-full h-14 text-lg rounded-2xl bg-black text-white hover:bg-gray-800 shadow-xl"
                            >
                                {loading ? <RefreshCcw className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                                {loading ? 'Création en cours...' : `Générer ${activeTab === 'cv' ? 'le CV' : 'la Lettre'}`}
                            </Button>
                        </div>
                    )}

                    {/* CV Results */}
                    {activeTab === 'cv' && result && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
                            <div className="grid grid-cols-2 gap-4">
                                <ATSScoreCard score={result.atsScore} />
                                <RiskAssessmentCard assessment={result.riskAssessment} />
                            </div>

                            <CVPreview content={result.content} />

                            <div className="flex gap-2 sticky bottom-4">
                                <Button variant="outline" className="flex-1 bg-white" onClick={() => setResult(null)}>Réessayer</Button>
                                <Button className="flex-1 bg-black text-white" onClick={() => handleExportText('cv')}>
                                    <Download className="mr-2 h-4 w-4" /> Exporter .txt
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Letter Results */}
                    {activeTab === 'letter' && letterResult && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
                            <CoverLetterScoreCard score={letterResult.score} />

                            <CoverLetterPreview coverLetter={letterResult.coverLetter} wordCount={letterResult.wordCount} />

                            <div className="flex gap-2 sticky bottom-4">
                                <Button variant="outline" className="flex-1 bg-white" onClick={() => setLetterResult(null)}>Réessayer</Button>
                                <Button className="flex-1 bg-black text-white" onClick={() => handleExportText('letter')}>
                                    <Download className="mr-2 h-4 w-4" /> Exporter .txt
                                </Button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
