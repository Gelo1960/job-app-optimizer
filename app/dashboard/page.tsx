import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">
          Bienvenue ! Commencez par analyser une offre d'emploi.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/dashboard/analyze">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                Analyser une offre
              </CardTitle>
              <CardDescription>
                Collez le texte d'une offre d'emploi pour extraire les mots-clés et obtenir des insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Commencer l'analyse</Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/dashboard/generate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📄</span>
                Générer un CV
              </CardTitle>
              <CardDescription>
                Créez un CV optimisé pour une offre d'emploi spécifique en quelques clics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Générer un CV</Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Candidatures envoyées</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Réponses positives</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Taux de réponse</CardDescription>
            <CardTitle className="text-3xl">0%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Score ATS moyen</CardDescription>
            <CardTitle className="text-3xl">-</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Pour commencer</CardTitle>
          <CardDescription>
            Complétez votre profil pour commencer à générer des CV optimisés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div className="flex-1">
              <p className="font-medium">Complétez votre profil</p>
              <p className="text-sm text-gray-600">
                Ajoutez vos informations personnelles, projets, expériences et compétences
              </p>
              <Link href="/dashboard/profile">
                <Button variant="link" className="p-0 h-auto mt-1">
                  Compléter le profil →
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-400">Analysez une offre d'emploi</p>
              <p className="text-sm text-gray-400">
                Disponible une fois votre profil complété
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-400">Générez votre premier CV</p>
              <p className="text-sm text-gray-400">
                Disponible après l'analyse d'une offre
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>
            Vos dernières candidatures et analyses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Aucune activité pour le moment</p>
            <p className="text-sm mt-2">Commencez par analyser une offre d'emploi</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
