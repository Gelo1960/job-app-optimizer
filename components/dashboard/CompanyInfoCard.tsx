import { CompanyEnrichment } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanyInfoCardProps {
  companyData: CompanyEnrichment;
}

export function CompanyInfoCard({ companyData }: CompanyInfoCardProps) {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🏢</span>
          <span>À propos de l'entreprise</span>
        </CardTitle>
        <CardDescription className="text-purple-900">
          Informations enrichies sur {companyData.companyName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Website & LinkedIn */}
        {(companyData.website || companyData.linkedinUrl) && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-900">Liens</h4>
            <div className="flex flex-wrap gap-3">
              {companyData.website && (
                <a
                  href={companyData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  🌐 Site web
                </a>
              )}
              {companyData.linkedinUrl && (
                <a
                  href={companyData.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        )}

        {/* Employee Count & Funding */}
        {(companyData.employeeCount || companyData.funding) && (
          <div className="grid grid-cols-2 gap-4">
            {companyData.employeeCount && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Effectif</div>
                <div className="text-lg font-bold text-gray-900">
                  {companyData.employeeCount} employés
                </div>
              </div>
            )}
            {companyData.funding && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Financement</div>
                <div className="text-lg font-bold text-gray-900">
                  {companyData.funding}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Achievements */}
        {companyData.recentAchievements && companyData.recentAchievements.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
              <span>🎯</span>
              <span>Réalisations récentes</span>
            </h4>
            <ul className="space-y-2">
              {companyData.recentAchievements.map((achievement, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pain Points */}
        {companyData.painPoints && companyData.painPoints.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>Défis identifiés</span>
            </h4>
            <ul className="space-y-2">
              {companyData.painPoints.map((pain, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>{pain}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Culture Keywords */}
        {companyData.cultureKeywords && companyData.cultureKeywords.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Culture d'entreprise</h4>
            <div className="flex flex-wrap gap-2">
              {companyData.cultureKeywords.map((keyword, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notable Products */}
        {companyData.notableProducts && companyData.notableProducts.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
              <span>🚀</span>
              <span>Produits principaux</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {companyData.notableProducts.map((product, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700"
                >
                  {product}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent News */}
        {companyData.recentNews && companyData.recentNews.length > 0 && (
          <div className="pt-4 border-t border-purple-200">
            <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <span>📰</span>
              <span>Actualités récentes</span>
            </h4>
            <div className="space-y-3">
              {companyData.recentNews.map((news, i) => (
                <div key={i} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="font-medium text-sm text-gray-900 mb-1">
                    {news.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(news.date).toLocaleDateString('fr-FR')} • {news.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
