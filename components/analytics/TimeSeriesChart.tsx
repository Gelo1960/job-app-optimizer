"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimeSeriesData } from "@/lib/services/analytics.service";

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  isLoading?: boolean;
}

export function TimeSeriesChart({ data, isLoading = false }: TimeSeriesChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution dans le temps</CardTitle>
          <CardDescription>Taux de réponse par semaine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution dans le temps</CardTitle>
          <CardDescription>Taux de réponse par semaine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex flex-col items-center justify-center text-gray-500">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-lg font-medium mb-2">Pas encore de données</p>
            <p className="text-sm">
              Les graphiques apparaîtront après quelques semaines de candidatures
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grouper les données par semaine (combiner toutes les variantes)
  const weeklyData = data.reduce((acc, item) => {
    const weekKey = item.week_start;
    if (!acc[weekKey]) {
      acc[weekKey] = {
        week: format(new Date(item.week_start), "dd MMM", { locale: fr }),
        applications: 0,
        responses: 0,
        rate: 0,
      };
    }
    acc[weekKey].applications += item.applications_count;
    acc[weekKey].responses += item.responses_count;
    return acc;
  }, {} as Record<string, any>);

  // Calculer les taux et convertir en tableau
  const chartData = Object.values(weeklyData)
    .map((week: any) => ({
      ...week,
      rate: week.applications > 0 ? (week.responses / week.applications) * 100 : 0,
    }))
    .reverse(); // Plus récent à droite

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution dans le temps</CardTitle>
        <CardDescription>
          Taux de réponse et volume par semaine (12 dernières semaines)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="rate"
              stroke="#3b82f6"
              name="Taux de réponse (%)"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="applications"
              stroke="#10b981"
              name="Candidatures envoyées"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Stats résumées */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total candidatures</p>
            <p className="text-2xl font-bold">
              {chartData.reduce((sum, w) => sum + w.applications, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total réponses</p>
            <p className="text-2xl font-bold text-green-600">
              {chartData.reduce((sum, w) => sum + w.responses, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Taux moyen</p>
            <p className="text-2xl font-bold text-blue-600">
              {chartData.length > 0
                ? (
                    chartData.reduce((sum, w) => sum + w.rate, 0) / chartData.length
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
