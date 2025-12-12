"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApplicationStats } from "@/lib/services/analytics.service";

interface StatsCardsProps {
  stats: ApplicationStats | null;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const cards = [
    {
      title: "Total envoyées",
      value: stats.totalApplications,
      description: "Candidatures envoyées",
      className: "",
    },
    {
      title: "En attente",
      value: stats.totalApplications - stats.totalResponses,
      description: "Sans réponse pour l'instant",
      className: "",
    },
    {
      title: "Réponses positives",
      value: stats.positiveResponses,
      description: `${stats.totalInterviews} entretiens`,
      className: "text-green-600",
    },
    {
      title: "Taux de réponse",
      value: `${stats.responseRate.toFixed(1)}%`,
      description: stats.avgDaysToResponse
        ? `Réponse en ${Math.round(stats.avgDaysToResponse)} jours`
        : "Pas encore de données",
      className: stats.responseRate >= 15 ? "text-green-600" : "",
    },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className={`text-3xl ${card.className}`}>
              {card.value}
            </CardTitle>
          </CardHeader>
          {card.description && (
            <CardContent>
              <p className="text-sm text-gray-600">{card.description}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
