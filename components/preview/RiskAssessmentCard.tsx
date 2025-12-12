import { RiskAssessment, RiskLevel } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RiskAssessmentCardProps {
  assessment: RiskAssessment;
}

export function RiskAssessmentCard({ assessment }: RiskAssessmentCardProps) {
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case "LOW":
        return { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100" };
      case "MEDIUM":
        return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100" };
      case "HIGH":
        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100" };
    }
  };

  const getRiskLabel = (level: RiskLevel) => {
    switch (level) {
      case "LOW":
        return "Faible";
      case "MEDIUM":
        return "Moyen";
      case "HIGH":
        return "Élevé";
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case "LOW":
        return "✓";
      case "MEDIUM":
        return "⚠";
      case "HIGH":
        return "✗";
    }
  };

  const overallColor = getRiskColor(assessment.overallRisk);

  return (
    <Card className={`${overallColor.border} border-2`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Évaluation des risques</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${overallColor.badge} ${overallColor.text}`}>
            {getRiskIcon(assessment.overallRisk)} Risque {getRiskLabel(assessment.overallRisk)}
          </span>
        </CardTitle>
        <CardDescription>
          {assessment.overallRisk === "LOW" && (
            <span className="text-green-600">
              Votre CV ne contient aucune affirmation à haut risque
            </span>
          )}
          {assessment.overallRisk === "MEDIUM" && (
            <span className="text-orange-600">
              Quelques affirmations nécessitent des justifications
            </span>
          )}
          {assessment.overallRisk === "HIGH" && (
            <span className="text-red-600">
              Attention: certaines affirmations sont à haut risque
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {assessment.flags.length === 0 ? (
          <div className="text-center py-4 text-green-600">
            <p className="font-medium">✓ Aucun signal d'alerte détecté</p>
            <p className="text-sm mt-1">Votre CV respecte les bonnes pratiques</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assessment.flags.map((flag, i) => {
              const flagColor = getRiskColor(flag.riskLevel);
              return (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${flagColor.bg} ${flagColor.border}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${flagColor.badge} ${flagColor.text}`}
                    >
                      {getRiskIcon(flag.riskLevel)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${flagColor.text} mb-1`}>
                        {flag.statement}
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Raison:</strong> {flag.reason}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Recommandation:</strong> {flag.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t space-y-2">
          <h4 className="font-semibold text-sm text-gray-900">Légende</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></span>
              <span className="text-gray-600">Faible: Zone verte</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-100 border border-orange-200"></span>
              <span className="text-gray-600">Moyen: À justifier</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></span>
              <span className="text-gray-600">Élevé: À éviter</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
