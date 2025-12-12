import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoverLetterScore } from "@/lib/services/cover-letter-generator.service";

interface CoverLetterScoreCardProps {
  score: CoverLetterScore;
}

export function CoverLetterScoreCard({ score }: CoverLetterScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-orange-600";
    return "text-red-600";
  };

  const getBarColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-orange-500";
    return "bg-red-500";
  };

  const breakdownItems = [
    { label: "Longueur", value: score.breakdown.length, description: "Respect du format 300-400 mots" },
    { label: "Hook", value: score.breakdown.hookQuality, description: "Accroche captivante, pas de clichés" },
    { label: "Personnalisation", value: score.breakdown.personalization, description: "Adaptation à l'entreprise" },
    { label: "Mots-clés", value: score.breakdown.keywordIntegration, description: "Intégration des mots-clés du job" },
    { label: "Call to Action", value: score.breakdown.callToAction, description: "Clarté et force du CTA" },
  ];

  return (
    <Card className="glass-card border-2 border-purple-200/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Score de Qualité</span>
          <span className={`text-3xl font-bold ${getScoreColor(score.overallScore)}`}>
            {score.overallScore}/100
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recommandation */}
        <div className={`p-4 rounded-lg border-2 ${
          score.overallScore >= 85
            ? "bg-green-50 border-green-200"
            : score.overallScore >= 70
            ? "bg-orange-50 border-orange-200"
            : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {score.overallScore >= 85 ? "✅" : score.overallScore >= 70 ? "⚠️" : "❌"}
            </span>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Recommandation</p>
              <p className="text-sm text-gray-700">{score.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Breakdown détaillé */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Détail du Score</h4>
          {breakdownItems.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-900">{item.label}</span>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <span className={`font-bold ${getScoreColor(item.value)}`}>
                  {item.value}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getBarColor(item.value)}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Légende */}
        <div className="pt-4 border-t space-y-2">
          <p className="text-xs font-semibold text-gray-700">Échelle de notation:</p>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-gray-600">85+ Excellent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded" />
              <span className="text-gray-600">70-84 Bon</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-gray-600">&lt;70 À améliorer</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
