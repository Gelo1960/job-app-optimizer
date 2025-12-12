"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VariantComparison } from "@/components/analytics/VariantComparison";
import { TimeSeriesChart } from "@/components/analytics/TimeSeriesChart";
import { RecommendationsPanel } from "@/components/analytics/RecommendationsPanel";
import type { VariantPerformance, TimeSeriesData } from "@/lib/services/analytics.service";
import type { RecommendationsResult } from "@/lib/services/recommendations.service";

export default function AnalyticsPage() {
  const [variants, setVariants] = useState<VariantPerformance[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch stats (which includes variants and time series)
        const statsResponse = await fetch("/api/analytics/stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setVariants(statsData.data?.byVariant || []);
          setTimeSeries(statsData.data?.timeSeries || []);
        }

        // Fetch recommendations
        const recsResponse = await fetch("/api/analytics/recommendations");
        if (recsResponse.ok) {
          const recsData = await recsResponse.json();
          setRecommendations(recsData.data || null);
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleExportCSV = () => {
    if (variants.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }

    // Créer le CSV
    const headers = [
      "Variante",
      "Candidatures envoyées",
      "Réponses totales",
      "Réponses positives",
      "Taux de réponse (%)",
      "Délai moyen (jours)",
    ];

    const rows = variants.map((v) => [
      v.cv_variant,
      v.total_sent,
      v.total_responses,
      v.positive_responses,
      v.response_rate?.toFixed(2) || "0",
      v.avg_days_to_response?.toFixed(1) || "-",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & A/B Testing</h1>
          <p className="text-gray-600 mt-2">
            Analysez les performances de vos différentes variantes de CV
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} disabled={variants.length === 0}>
          Exporter CSV
        </Button>
      </div>

      {/* A/B Test Results - Variant Cards */}
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : variants.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {variants.map((variant) => (
            <Card key={variant.cv_variant}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {variant.cv_variant.replace(/_/g, " ")}
                </CardTitle>
                <CardDescription>
                  {variant.total_sent} candidature{variant.total_sent > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Taux de réponse</p>
                  <p
                    className={`text-2xl font-bold ${
                      (variant.response_rate || 0) >= 15
                        ? "text-green-600"
                        : "text-gray-900"
                    }`}
                  >
                    {variant.response_rate?.toFixed(1) || 0}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Réponses positives</p>
                  <p className="text-2xl font-bold text-green-600">
                    {variant.positive_responses}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Délai moyen</p>
                  <p className="text-2xl font-bold">
                    {variant.avg_days_to_response
                      ? `${Math.round(variant.avg_days_to_response)} jours`
                      : "-"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variante A</CardTitle>
              <CardDescription>Aucune donnée</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Candidatures</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Taux de réponse</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Délai moyen</p>
                <p className="text-2xl font-bold">- jours</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variante B</CardTitle>
              <CardDescription>Aucune donnée</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Candidatures</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Taux de réponse</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Délai moyen</p>
                <p className="text-2xl font-bold">- jours</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variante C</CardTitle>
              <CardDescription>Aucune donnée</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Candidatures</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Taux de réponse</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Délai moyen</p>
                <p className="text-2xl font-bold">- jours</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Variant Comparison Chart */}
      <VariantComparison variants={variants} isLoading={isLoading} />

      {/* Time Series Chart */}
      <TimeSeriesChart data={timeSeries} isLoading={isLoading} />

      {/* Recommendations */}
      <RecommendationsPanel recommendations={recommendations} isLoading={isLoading} />
    </div>
  );
}
