import { GhostJobDetection } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GhostJobWarningProps {
  detection: GhostJobDetection;
}

export function GhostJobWarning({ detection }: GhostJobWarningProps) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'text-green-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'HIGH':
        return 'text-orange-600';
      case 'VERY_HIGH':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskBgColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'bg-green-50 border-green-200';
      case 'MEDIUM':
        return 'bg-yellow-50 border-yellow-200';
      case 'HIGH':
        return 'bg-orange-50 border-orange-200';
      case 'VERY_HIGH':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'APPLY':
        return '✅';
      case 'APPLY_WITH_CAUTION':
        return '⚠️';
      case 'SKIP':
        return '🚫';
      default:
        return '❓';
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'APPLY':
        return 'Vous pouvez postuler';
      case 'APPLY_WITH_CAUTION':
        return 'Postulez avec prudence';
      case 'SKIP':
        return 'Ne pas postuler';
      default:
        return 'Analyse en cours';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-yellow-600';
      case 'medium':
        return 'text-orange-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return '⚡';
      case 'medium':
        return '⚠️';
      case 'high':
        return '🔴';
      default:
        return '•';
    }
  };

  // Ne pas afficher si score très bas
  if (detection.score < 10) {
    return null;
  }

  return (
    <Card className={`${getRiskBgColor(detection.riskLevel)} border-2`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-2xl">{getRecommendationIcon(detection.recommendation)}</span>
            <span>Analyse Ghost Job</span>
          </span>
          <span className={`text-3xl font-bold ${getRiskColor(detection.riskLevel)}`}>
            {detection.score}/100
          </span>
        </CardTitle>
        <CardDescription className={getRiskColor(detection.riskLevel) + ' font-medium'}>
          Risque: {detection.riskLevel.replace('_', ' ')} • {getRecommendationText(detection.recommendation)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Visualization */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Score de suspicion</span>
            <span className="font-medium">{detection.score}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                detection.score >= 60
                  ? 'bg-red-600'
                  : detection.score >= 40
                  ? 'bg-orange-500'
                  : detection.score >= 20
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, detection.score)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Plus le score est élevé, plus l'offre est suspecte
          </p>
        </div>

        {/* Reasoning */}
        <div className="pt-3 border-t">
          <p className="text-sm text-gray-700 leading-relaxed">
            {detection.reasoning}
          </p>
        </div>

        {/* Signals Detected */}
        {detection.signals && detection.signals.length > 0 && (
          <div className="pt-3 border-t">
            <h4 className="font-semibold text-sm text-gray-900 mb-3">
              Signaux suspects détectés ({detection.signals.length})
            </h4>
            <div className="space-y-2">
              {detection.signals.map((signal, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-200"
                >
                  <span className={`text-lg ${getSeverityColor(signal.severity)}`}>
                    {getSeverityIcon(signal.severity)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900 capitalize">
                        {signal.type.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-xs font-semibold ${getSeverityColor(signal.severity)}`}>
                        +{signal.points} pts
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{signal.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence Level */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Niveau de confiance de la détection</span>
            <span className="font-medium">
              {Math.round(detection.confidenceLevel * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${detection.confidenceLevel * 100}%` }}
            />
          </div>
        </div>

        {/* Recommendations */}
        {detection.recommendation === 'APPLY_WITH_CAUTION' && (
          <div className="pt-3 border-t bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-semibold text-sm text-yellow-900 mb-2">
              ⚠️ Conseils avant de postuler
            </h4>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li>• Vérifiez l'existence réelle de l'entreprise sur LinkedIn</li>
              <li>• Recherchez des avis d'employés sur Glassdoor</li>
              <li>• Contactez directement l'entreprise pour confirmer le recrutement</li>
              <li>• Soyez attentif aux réponses vagues ou automatisées</li>
            </ul>
          </div>
        )}

        {detection.recommendation === 'SKIP' && (
          <div className="pt-3 border-t bg-red-50 rounded-lg p-4 border border-red-200">
            <h4 className="font-semibold text-sm text-red-900 mb-2">
              🚫 Pourquoi éviter cette offre
            </h4>
            <p className="text-sm text-red-800">
              Cette offre présente trop de signaux d'alerte pour être légitime. Il est probable
              qu'il s'agisse d'une offre fantôme publiée pour collecter des CV ou donner
              l'impression de croissance sans réel besoin de recrutement.
            </p>
          </div>
        )}

        {detection.recommendation === 'APPLY' && detection.score < 20 && (
          <div className="pt-3 border-t bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-sm text-green-900 mb-2">
              ✅ Offre apparemment légitime
            </h4>
            <p className="text-sm text-green-800">
              Cette offre ne présente pas de signaux suspects majeurs. Vous pouvez postuler
              en toute confiance.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
