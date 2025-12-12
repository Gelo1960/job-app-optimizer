import { ATSScore } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ATSScoreCardProps {
  score: ATSScore;
}

export function ATSScoreCard({ score }: ATSScoreCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-green-600";
    if (value >= 60) return "bg-orange-600";
    return "bg-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Score ATS</span>
          <span className={`text-4xl font-bold ${getScoreColor(score.overallScore)}`}>
            {score.overallScore}/100
          </span>
        </CardTitle>
        <CardDescription>
          {score.willPass ? (
            <span className="text-green-600 font-medium">
              ✓ Votre CV devrait passer les filtres ATS
            </span>
          ) : (
            <span className="text-red-600 font-medium">
              ✗ Votre CV risque d'être filtré par les ATS
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Score global</span>
            <span className="font-medium">{score.overallScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${getProgressColor(score.overallScore)}`}
              style={{ width: `${score.overallScore}%` }}
            />
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 pt-2 border-t">
          <h4 className="font-semibold text-sm text-gray-900">Détails</h4>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Format parsable</span>
              <span className="font-medium">{score.breakdown.formatParsable}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${score.breakdown.formatParsable}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Correspondance mots-clés</span>
              <span className="font-medium">{score.breakdown.keywordMatch}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(score.breakdown.keywordMatch)}`}
                style={{ width: `${score.breakdown.keywordMatch}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Structure standard</span>
              <span className="font-medium">{score.breakdown.structureStandard}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${score.breakdown.structureStandard}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Format des dates</span>
              <span className="font-medium">{score.breakdown.dateFormat}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${score.breakdown.dateFormat}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Cohérence chronologique</span>
              <span className="font-medium">{score.breakdown.chronologyConsistent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${score.breakdown.chronologyConsistent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Threshold Info */}
        <div className="pt-2 border-t text-sm text-gray-600">
          <p>
            Seuil de passage: <strong>{score.passThreshold}%</strong>
          </p>
          <p className="text-xs mt-1">
            Les ATS filtrent généralement les CV en dessous de ce seuil
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
