import { getAuthenticatedClient } from '@/lib/db/server-actions';
import type { VariantPerformance, ChannelPerformance } from './analytics.service';

// ============================================================================
// TYPES POUR RECOMMENDATIONS
// ============================================================================

export type RecommendationType = 'variant' | 'channel' | 'timing' | 'info' | 'warning';
export type RecommendationPriority = 'high' | 'medium' | 'low';

export interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  priority: RecommendationPriority;
  data?: any;
  actionable?: {
    action: string;
    label: string;
  };
}

export interface RecommendationsResult {
  hasEnoughData: boolean;
  minimumRequired: number;
  currentCount: number;
  recommendations: Recommendation[];
}

// ============================================================================
// SERVICE RECOMMENDATIONS
// ============================================================================

export class RecommendationsService {
  private readonly MINIMUM_DATA_POINTS = 10;
  private readonly SIGNIFICANCE_THRESHOLD = 20; // Nombre minimum par variante
  private readonly GOOD_RESPONSE_RATE = 15; // 15% est un bon taux
  private readonly EXCELLENT_RESPONSE_RATE = 25; // 25% est excellent

  /**
   * Récupère le user_profile_id à partir du user_id (auth)
   */
  private async getUserProfileId(userId?: string): Promise<string | null> {
    const supabase = await getAuthenticatedClient();
    const { data: { user } } = await supabase.auth.getUser();
    const authUserId = userId || user?.id;

    if (!authUserId) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', authUserId)
      .single();

    if (error || !data) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data.id;
  }

  /**
   * Génère toutes les recommandations pour un utilisateur
   */
  async generateRecommendations(userProfileId?: string): Promise<RecommendationsResult> {
    try {
      const supabase = await getAuthenticatedClient();
      const profileId = userProfileId || await this.getUserProfileId();
      if (!profileId) {
        return this.getInsufficientDataResponse(0);
      }

      // Utiliser la fonction SQL pour obtenir les recommandations de base
      const { data, error } = await supabase.rpc('get_recommendations', {
        p_user_profile_id: profileId,
      });

      if (error) {
        console.error('Error fetching recommendations:', error);
        return this.getInsufficientDataResponse(0);
      }

      // Si pas assez de données, retourner tel quel
      if (!data.has_enough_data) {
        return {
          hasEnoughData: false,
          minimumRequired: data.minimum_required,
          currentCount: data.data_points,
          recommendations: this.getBasicRecommendations(),
        };
      }

      // Enrichir avec des recommandations supplémentaires
      const sqlRecommendations = data.recommendations.filter((r: any) => r !== null);
      const additionalRecommendations = await this.getAdditionalRecommendations(profileId);

      return {
        hasEnoughData: true,
        minimumRequired: this.MINIMUM_DATA_POINTS,
        currentCount: data.data_points,
        recommendations: [...sqlRecommendations, ...additionalRecommendations],
      };
    } catch (err) {
      console.error('Error in generateRecommendations:', err);
      return this.getInsufficientDataResponse(0);
    }
  }

  /**
   * Recommandations supplémentaires basées sur l'analyse des patterns
   */
  private async getAdditionalRecommendations(userProfileId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Analyser les variantes
    const variantRecs = await this.analyzeVariants(userProfileId);
    recommendations.push(...variantRecs);

    // Analyser les canaux
    const channelRecs = await this.analyzeChannels(userProfileId);
    recommendations.push(...channelRecs);

    // Analyser le volume
    const volumeRecs = await this.analyzeVolume(userProfileId);
    recommendations.push(...volumeRecs);

    // Analyser la cohérence
    const consistencyRecs = await this.analyzeConsistency(userProfileId);
    recommendations.push(...consistencyRecs);

    return recommendations;
  }

  /**
   * Analyse les variantes de CV
   */
  private async analyzeVariants(userProfileId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    const supabase = await getAuthenticatedClient();
    const { data, error } = await supabase
      .from('variant_performance')
      .select('*')
      .eq('user_profile_id', userProfileId);

    if (error || !data || data.length === 0) {
      return recommendations;
    }

    const variants: VariantPerformance[] = data;

    // Trouver les variantes peu testées
    const untertestedVariants = variants.filter(
      (v) => v.total_sent < this.SIGNIFICANCE_THRESHOLD
    );

    if (untertestedVariants.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Variantes insuffisamment testées',
        description: `Vous devriez tester davantage les variantes ${untertestedVariants
          .map((v) => `"${v.cv_variant}"`)
          .join(', ')} pour obtenir des résultats statistiquement significatifs (minimum ${
          this.SIGNIFICANCE_THRESHOLD
        } candidatures).`,
        priority: 'medium',
        data: { variants: untertestedVariants },
      });
    }

    // Trouver la variante perdante évidente
    const sortedByPerformance = [...variants].sort(
      (a, b) => (b.response_rate || 0) - (a.response_rate || 0)
    );

    if (sortedByPerformance.length >= 2) {
      const best = sortedByPerformance[0];
      const worst = sortedByPerformance[sortedByPerformance.length - 1];

      // Si la différence est significative (>10%) et que les deux sont bien testées
      if (
        best.total_sent >= this.SIGNIFICANCE_THRESHOLD &&
        worst.total_sent >= this.SIGNIFICANCE_THRESHOLD &&
        (best.response_rate || 0) - (worst.response_rate || 0) > 10
      ) {
        recommendations.push({
          type: 'variant',
          title: `Abandonnez la variante "${worst.cv_variant}"`,
          description: `Cette variante performe ${Math.round(
            (best.response_rate || 0) - (worst.response_rate || 0)
          )}% moins bien que "${best.cv_variant}". Concentrez vos efforts sur les variantes performantes.`,
          priority: 'high',
          data: { best, worst },
        });
      }
    }

    // Identifier les variantes avec excellent taux
    const excellentVariants = variants.filter(
      (v) => (v.response_rate || 0) >= this.EXCELLENT_RESPONSE_RATE
    );

    if (excellentVariants.length > 0) {
      recommendations.push({
        type: 'variant',
        title: 'Excellent résultat!',
        description: `Votre variante "${excellentVariants[0].cv_variant}" affiche un taux de réponse exceptionnel de ${excellentVariants[0].response_rate}%. Continuez sur cette lancée!`,
        priority: 'high',
        data: { variant: excellentVariants[0] },
      });
    }

    return recommendations;
  }

  /**
   * Analyse les canaux de candidature
   */
  private async analyzeChannels(userProfileId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    const supabase = await getAuthenticatedClient();
    const { data, error } = await supabase
      .from('channel_performance')
      .select('*')
      .eq('user_profile_id', userProfileId);

    if (error || !data || data.length === 0) {
      return recommendations;
    }

    const channels: ChannelPerformance[] = data;

    // Trouver le canal avec le délai de réponse le plus rapide
    const fastestChannel = channels
      .filter((c) => c.avg_days_to_response !== null)
      .sort((a, b) => (a.avg_days_to_response || 999) - (b.avg_days_to_response || 999))[0];

    if (fastestChannel && (fastestChannel.avg_days_to_response || 0) < 5) {
      recommendations.push({
        type: 'channel',
        title: `Le canal "${this.formatChannelName(fastestChannel.channel)}" est ultra-rapide`,
        description: `Vous obtenez des réponses en moyenne en ${Math.round(
          fastestChannel.avg_days_to_response || 0
        )} jours via ce canal. Idéal pour les candidatures urgentes.`,
        priority: 'medium',
        data: { channel: fastestChannel },
      });
    }

    // Trouver les canaux peu utilisés
    const totalApplications = channels.reduce((sum, c) => sum + c.total_sent, 0);
    const underusedChannels = channels.filter(
      (c) => c.total_sent < totalApplications * 0.15 && totalApplications > 30
    );

    if (underusedChannels.length > 0) {
      recommendations.push({
        type: 'info',
        title: 'Diversifiez vos canaux',
        description: `Vous utilisez peu les canaux ${underusedChannels
          .map((c) => this.formatChannelName(c.channel))
          .join(', ')}. Essayez de diversifier pour maximiser vos chances.`,
        priority: 'low',
      });
    }

    return recommendations;
  }

  /**
   * Analyse le volume de candidatures
   */
  private async analyzeVolume(userProfileId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Récupérer les stats des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const supabase = await getAuthenticatedClient();
    const { data, error } = await supabase
      .from('applications')
      .select('id, applied_date')
      .eq('user_profile_id', userProfileId)
      .gte('applied_date', thirtyDaysAgo.toISOString().split('T')[0]);

    if (error || !data) {
      return recommendations;
    }

    const recentApplications = data.length;
    const avgPerWeek = (recentApplications / 30) * 7;

    // Recommandations basées sur le volume
    if (avgPerWeek < 5) {
      recommendations.push({
        type: 'warning',
        title: 'Augmentez votre cadence',
        description: `Vous envoyez en moyenne ${Math.round(
          avgPerWeek
        )} candidatures par semaine. Pour maximiser vos chances, visez au moins 10-15 candidatures par semaine.`,
        priority: 'medium',
        data: { avgPerWeek },
      });
    } else if (avgPerWeek >= 15) {
      recommendations.push({
        type: 'info',
        title: 'Excellent volume de candidatures',
        description: `Vous maintenez une cadence solide de ${Math.round(
          avgPerWeek
        )} candidatures par semaine. Continuez!`,
        priority: 'low',
        data: { avgPerWeek },
      });
    }

    return recommendations;
  }

  /**
   * Analyse la cohérence des candidatures
   */
  private async analyzeConsistency(userProfileId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    const supabase = await getAuthenticatedClient();
    const { data, error } = await supabase
      .from('applications')
      .select('id, applied_date, status, response_date')
      .eq('user_profile_id', userProfileId)
      .order('applied_date', { ascending: false })
      .limit(50);

    if (error || !data || data.length < 20) {
      return recommendations;
    }

    // Analyser les candidatures sans suivi
    const pendingOld = data.filter((app) => {
      if (app.status !== 'pending') return false;
      const appliedDate = new Date(app.applied_date);
      const daysSince = Math.floor(
        (Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSince > 14;
    });

    if (pendingOld.length > 5) {
      recommendations.push({
        type: 'warning',
        title: 'Mettez à jour vos statuts',
        description: `Vous avez ${pendingOld.length} candidatures de plus de 14 jours sans mise à jour. Pensez à mettre à jour leur statut pour des analytics précises.`,
        priority: 'medium',
        data: { count: pendingOld.length },
        actionable: {
          action: 'update_statuses',
          label: 'Mettre à jour',
        },
      });
    }

    // Analyser le taux de suivi
    const withResponse = data.filter((app) => app.response_date !== null);
    const followUpRate = (withResponse.length / data.length) * 100;

    if (followUpRate < 30) {
      recommendations.push({
        type: 'info',
        title: 'Améliorez votre suivi',
        description: `Seulement ${Math.round(
          followUpRate
        )}% de vos candidatures ont un statut de réponse enregistré. Un bon suivi vous aidera à identifier les meilleures stratégies.`,
        priority: 'low',
      });
    }

    return recommendations;
  }

  /**
   * Recommandations génériques pour débutants
   */
  private getBasicRecommendations(): Recommendation[] {
    return [
      {
        type: 'info',
        title: 'Commencez par tester plusieurs variantes',
        description:
          'Créez au moins 3 variantes de votre CV (ex: technique, produit, management) et testez-les avec au moins 10 candidatures chacune.',
        priority: 'high',
      },
      {
        type: 'info',
        title: 'Diversifiez vos canaux',
        description:
          'Essayez différents canaux: candidature directe sur le site, LinkedIn, email au recruteur. Certains marchent mieux selon les entreprises.',
        priority: 'medium',
      },
      {
        type: 'info',
        title: 'Maintenez une cadence régulière',
        description:
          "Visez 10-15 candidatures par semaine. La recherche d'emploi est un jeu de nombres: plus vous candidatez (intelligemment), plus vous avez de chances.",
        priority: 'medium',
      },
      {
        type: 'timing',
        title: 'Candidatez en début de semaine',
        description:
          "Les études montrent que les candidatures envoyées le mardi ou mercredi matin ont un meilleur taux d'ouverture.",
        priority: 'low',
      },
    ];
  }

  /**
   * Réponse quand il n'y a pas assez de données
   */
  private getInsufficientDataResponse(count: number): RecommendationsResult {
    return {
      hasEnoughData: false,
      minimumRequired: this.MINIMUM_DATA_POINTS,
      currentCount: count,
      recommendations: this.getBasicRecommendations(),
    };
  }

  /**
   * Formate le nom du canal pour affichage
   */
  private formatChannelName(channel: string): string {
    const names: Record<string, string> = {
      linkedin: 'LinkedIn',
      direct_email: 'Email direct',
      company_website: 'Site entreprise',
      other: 'Autre',
    };

    return names[channel] || channel;
  }
}

// Export singleton instance
export const recommendationsService = new RecommendationsService();
