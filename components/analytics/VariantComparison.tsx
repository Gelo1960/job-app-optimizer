"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { VariantPerformance } from "@/lib/services/analytics.service";

interface VariantComparisonProps {
  variants: VariantPerformance[];
  isLoading?: boolean;
}

export function VariantComparison({ variants, isLoading = false }: VariantComparisonProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparaison des variantes</CardTitle>
          <CardDescription>Performance par type de CV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!variants || variants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparaison des variantes</CardTitle>
          <CardDescription>Performance par type de CV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex flex-col items-center justify-center text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg font-medium mb-2">Pas encore de données</p>
            <p className="text-sm">
              Envoyez des candidatures pour voir les statistiques apparaître
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Préparer les données pour le graphique
  const chartData = variants.map((v) => ({
    name: v.cv_variant.replace(/_/g, " "),
    "Taux de réponse": v.response_rate || 0,
    "Candidatures": v.total_sent,
    "Réponses positives": v.positive_responses,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparaison des variantes</CardTitle>
        <CardDescription>
          Performance des différentes versions de votre CV
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Taux de réponse" fill="#3b82f6" />
            <Bar dataKey="Réponses positives" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>

        {/* Tableau détaillé */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="pb-2 font-medium">Variante</th>
                <th className="pb-2 font-medium text-right">Envoyées</th>
                <th className="pb-2 font-medium text-right">Réponses</th>
                <th className="pb-2 font-medium text-right">Taux</th>
                <th className="pb-2 font-medium text-right">Délai moyen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {variants.map((variant) => (
                <tr key={variant.cv_variant}>
                  <td className="py-2 font-medium">
                    {variant.cv_variant.replace(/_/g, " ")}
                  </td>
                  <td className="py-2 text-right">{variant.total_sent}</td>
                  <td className="py-2 text-right">
                    <span className="text-green-600 font-medium">
                      {variant.positive_responses}
                    </span>
                    {" / "}
                    {variant.total_responses}
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={
                        (variant.response_rate || 0) >= 15
                          ? "text-green-600 font-medium"
                          : ""
                      }
                    >
                      {variant.response_rate?.toFixed(1) || 0}%
                    </span>
                  </td>
                  <td className="py-2 text-right text-gray-600">
                    {variant.avg_days_to_response
                      ? `${Math.round(variant.avg_days_to_response)} jours`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
