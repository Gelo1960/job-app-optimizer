"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { CoverLetter } from "@/lib/services/cover-letter-generator.service";
import { CoverLetterContent } from "@/lib/types";

interface CoverLetterPreviewProps {
  coverLetter: CoverLetter;
  wordCount?: number;
}

export function CoverLetterPreview({ coverLetter, wordCount }: CoverLetterPreviewProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Convertir CoverLetter vers CoverLetterContent pour le PDF
      const letterContent: CoverLetterContent = {
        greeting: coverLetter.greeting,
        hook: coverLetter.introduction,
        credibility: coverLetter.body.credibility,
        uniqueValue: coverLetter.body.uniqueValue,
        culturalFit: coverLetter.body.culturalFit,
        cta: coverLetter.closing,
        signature: coverLetter.signature,
      };

      // Générer le nom de fichier
      const filename = 'Lettre_Motivation.pdf';

      // Appeler l'API
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          letterContent,
          filename,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erreur lors de l\'export du PDF. Veuillez réessayer.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="cover-letter-preview bg-white">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Lettre de Motivation</h3>
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            variant="default"
            size="sm"
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exporter en PDF
              </>
            )}
          </Button>
        </div>
        {wordCount && (
          <div className="text-sm">
            <span className="text-gray-600">Nombre de mots:</span>{" "}
            <span className={`font-semibold ${
              wordCount >= 300 && wordCount <= 400
                ? "text-green-600"
                : wordCount >= 250 && wordCount <= 450
                ? "text-orange-600"
                : "text-red-600"
            }`}>
              {wordCount}
            </span>
            <span className="text-gray-500 ml-1">(cible: 300-400)</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-8 space-y-6">
        {/* Greeting */}
        <div className="text-gray-800">
          {coverLetter.greeting}
        </div>

        {/* Introduction / Hook */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
          <p className="text-gray-800 leading-relaxed font-medium">
            {coverLetter.introduction}
          </p>
          <div className="mt-2 text-xs text-blue-600 font-semibold">
            ↑ HOOK - Première impression critique
          </div>
        </div>

        {/* Body - Credibility */}
        <div className="space-y-4">
          <p className="text-gray-800 leading-relaxed text-justify">
            {coverLetter.body.credibility}
          </p>
          <div className="text-xs text-gray-500 italic">
            → Crédibilité & preuves concrètes
          </div>
        </div>

        {/* Body - Unique Value */}
        <div className="space-y-4">
          <p className="text-gray-800 leading-relaxed text-justify">
            {coverLetter.body.uniqueValue}
          </p>
          <div className="text-xs text-gray-500 italic">
            → Valeur unique & différenciation
          </div>
        </div>

        {/* Body - Cultural Fit */}
        <div className="space-y-4">
          <p className="text-gray-800 leading-relaxed text-justify">
            {coverLetter.body.culturalFit}
          </p>
          <div className="text-xs text-gray-500 italic">
            → Fit culturel & recherche entreprise
          </div>
        </div>

        {/* Closing / CTA */}
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
          <p className="text-gray-800 leading-relaxed">
            {coverLetter.closing}
          </p>
          <div className="mt-2 text-xs text-green-600 font-semibold">
            ↑ CALL TO ACTION - Doit être concret et actionnable
          </div>
        </div>

        {/* Signature */}
        <div className="mt-8 pt-4 border-t">
          <div className="text-gray-800 whitespace-pre-line">
            {coverLetter.signature}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
