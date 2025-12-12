"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RecommendationsResult, RecommendationType } from "@/lib/services/recommendations.service";

interface RecommendationsPanelProps {
  recommendations: RecommendationsResult | null;
  isLoading?: boolean;
}

const iconMap: Record<RecommendationType, string> = {
  variant: "🎯",
  channel: "📡",
  timing: "⏰",
  info: "💡",
  warning: "⚠️",
};

const colorMap: Record<string, string> = {
  high: "bg-blue-50 border-blue-200",
  medium: "bg-green-50 border-green-200",
  low: "bg-gray-50 border-gray-200",
};

const textColorMap: Record<string, string> = {
  high: "text-blue-900",
  medium: "text-green-900",
  low: "text-gray-900",
};

const descColorMap: Record<string, string> = {
  high: "text-blue-700",
  medium: "text-green-700",
  low: "text-gray-700",
};

export function RecommendationsPanel({
  recommendations,
  isLoading = false,
}: RecommendationsPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommandations</CardTitle>
          <CardDescription>Basées sur vos données</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommandations</CardTitle>
        <CardDescription>
          {recommendations.hasEnoughData
            ? `Basées sur ${recommendations.currentCount} candidatures`
            : `${recommendations.currentCount}/${recommendations.minimumRequired} candidatures - Collectez plus de données`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!recommendations.hasEnoughData && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Collectez plus de données:</strong> Vous avez enregistré{" "}
              {recommendations.currentCount} candidatures. Envoyez-en au moins{" "}
              {recommendations.minimumRequired} pour obtenir des recommandations
              personnalisées basées sur vos résultats réels.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {recommendations.recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${
                colorMap[rec.priority] || colorMap.low
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{iconMap[rec.type] || "📌"}</span>
                <div className="flex-1">
                  <p
                    className={`font-medium mb-1 ${
                      textColorMap[rec.priority] || textColorMap.low
                    }`}
                  >
                    {rec.title}
                  </p>
                  <p
                    className={`text-sm ${
                      descColorMap[rec.priority] || descColorMap.low
                    }`}
                  >
                    {rec.description}
                  </p>
                  {rec.actionable && (
                    <Button variant="outline" size="sm" className="mt-2">
                      {rec.actionable.label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
