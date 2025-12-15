import { getAuthenticatedClient, getAuthenticatedUser } from '@/lib/db/server-actions';
import type { Application, ABTestResult, ApplicationStatus } from '@/lib/types';

// ============================================================================
// TYPES SPÉCIFIQUES AU SERVICE ANALYTICS
// ============================================================================

export interface ApplicationStats {
  totalApplications: number;
  totalResponses: number;
  positiveResponses: number;
  negativeResponses: number;
  noResponses: number;
  responseRate: number;
  avgDaysToResponse: number | null;
  totalInterviews: number;
}

export interface VariantPerformance {
  cv_variant: string;
  total_sent: number;
  total_responses: number;
  positive_responses: number;
  negative_responses: number;
  no_responses: number;
  total_interviews: number;
  response_rate: number;
  positive_rate: number;
  interview_rate: number;
  avg_days_to_response: number | null;
  fastest_response_days: number | null;
  slowest_response_days: number | null;
  weekday_response_rate: number | null;
  weekend_response_rate: number | null;
  last_application_date: string;
  first_application_date: string;
}

export interface ChannelPerformance {
  channel: string;
  total_sent: number;
  total_responses: number;
  positive_responses: number;
  response_rate: number;
  avg_days_to_response: number | null;
}

export interface TimeSeriesData {
  week_start: string;
  cv_variant: string;
  applications_count: number;
  responses_count: number;
  positive_count: number;
  weekly_response_rate: number;
}

export interface UserStatistics {
  overview: ApplicationStats;
  byVariant: VariantPerformance[];
  byChannel: ChannelPerformance[];
  timeSeries: TimeSeriesData[];
}

export interface CreateApplicationInput {
  userProfileId: string;
  jobTitle: string;
  company: string;
  jobUrl?: string;
  cvVariant: string;
  letterVariant?: string;
  channel: 'linkedin' | 'direct_email' | 'company_website' | 'other';
  appliedDate?: string; // ISO date, default today
  notes?: string;
  cvFilePath?: string;
  letterFilePath?: string;
}

export interface UpdateApplicationStatusInput {
  status: ApplicationStatus;
  responseDate?: string; // ISO date
  notes?: string;
}

export interface ApplicationEvent {
  id: string;
  application_id: string;
  event_type: string;
  event_timestamp: string;
  metadata: Record<string, any>;
}

// ============================================================================
// SERVICE ANALYTICS
// ============================================================================

export class AnalyticsService {
  /**
   * Récupère le user_profile_id à partir du user_id (auth)
   */
  private async getUserProfileId(userId?: string): Promise<string | null> {
    const supabase = await getAuthenticatedClient();

    // Si userId fourni, l'utiliser directement
    if (userId) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data.id;
    }

    // Sinon, obtenir l'utilisateur authentifié
    try {
      const user = await getAuthenticatedUser();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data.id;
    } catch {
      return null;
    }
  }

  /**
   * Crée une nouvelle candidature
   */
  async trackApplication(input: CreateApplicationInput): Promise<Application | null> {
    try {
      const supabase = await getAuthenticatedClient();

      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_profile_id: input.userProfileId,
          job_title: input.jobTitle,
          company: input.company,
          job_url: input.jobUrl,
          cv_variant: input.cvVariant,
          letter_variant: input.letterVariant,
          channel: input.channel,
          status: 'pending',
          applied_date: input.appliedDate || new Date().toISOString().split('T')[0],
          notes: input.notes,
          cv_file_path: input.cvFilePath,
          letter_file_path: input.letterFilePath,
        })
        .select()
        .single();

      if (error) {
        console.error('Error tracking application:', error);
        return null;
      }

      // Créer l'événement 'created'
      await this.addEvent(data.id, 'created', {
        cv_variant: input.cvVariant,
        channel: input.channel,
      });

      // Rafraîchir les analytics
      await this.refreshAnalytics();

      return this.mapApplicationFromDB(data);
    } catch (err) {
      console.error('Error in trackApplication:', err);
      return null;
    }
  }

  /**
   * Met à jour le statut d'une candidature
   */
  async updateApplicationStatus(
    applicationId: string,
    update: UpdateApplicationStatusInput
  ): Promise<boolean> {
    try {
      const supabase = await getAuthenticatedClient();

      const { error } = await supabase
        .from('applications')
        .update({
          status: update.status,
          response_date: update.responseDate,
          notes: update.notes,
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Error updating application status:', error);
        return false;
      }

      // Créer un événement correspondant
      const eventType = this.mapStatusToEventType(update.status);
      if (eventType) {
        await this.addEvent(applicationId, eventType, {
          status: update.status,
          response_date: update.responseDate,
        });
      }

      // Rafraîchir les analytics
      await this.refreshAnalytics();

      return true;
    } catch (err) {
      console.error('Error in updateApplicationStatus:', err);
      return false;
    }
  }

  /**
   * Récupère toutes les candidatures d'un utilisateur
   */
  async getApplications(
    userProfileId?: string,
    filters?: {
      status?: ApplicationStatus;
      cvVariant?: string;
      channel?: string;
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<Application[]> {
    try {
      const supabase = await getAuthenticatedClient();

      const profileId = userProfileId || await this.getUserProfileId();
      if (!profileId) return [];

      let query = supabase
        .from('applications')
        .select('*')
        .eq('user_profile_id', profileId)
        .order('applied_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.cvVariant) {
        query = query.eq('cv_variant', filters.cvVariant);
      }
      if (filters?.channel) {
        query = query.eq('channel', filters.channel);
      }
      if (filters?.fromDate) {
        query = query.gte('applied_date', filters.fromDate);
      }
      if (filters?.toDate) {
        query = query.lte('applied_date', filters.toDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching applications:', error);
        return [];
      }

      return (data || []).map(this.mapApplicationFromDB);
    } catch (err) {
      console.error('Error in getApplications:', err);
      return [];
    }
  }

  /**
   * Récupère les statistiques globales
   */
  async getApplicationStats(userProfileId?: string): Promise<ApplicationStats | null> {
    try {
      const supabase = await getAuthenticatedClient();

      const profileId = userProfileId || await this.getUserProfileId();
      if (!profileId) return null;

      const { data, error } = await supabase.rpc('get_user_statistics', {
        p_user_profile_id: profileId,
      });

      if (error || !data) {
        console.error('Error fetching stats:', error);
        return null;
      }

      return data.overview as ApplicationStats;
    } catch (err) {
      console.error('Error in getApplicationStats:', err);
      return null;
    }
  }

  /**
   * Récupère toutes les statistiques (overview + détails)
   */
  async getUserStatistics(userProfileId?: string): Promise<UserStatistics | null> {
    try {
      const supabase = await getAuthenticatedClient();

      const profileId = userProfileId || await this.getUserProfileId();
      if (!profileId) return null;

      const { data, error } = await supabase.rpc('get_user_statistics', {
        p_user_profile_id: profileId,
      });

      if (error || !data) {
        console.error('Error fetching user statistics:', error);
        return null;
      }

      return {
        overview: data.overview,
        byVariant: data.by_variant || [],
        byChannel: data.by_channel || [],
        timeSeries: data.time_series || [],
      };
    } catch (err) {
      console.error('Error in getUserStatistics:', err);
      return null;
    }
  }

  /**
   * Récupère les résultats A/B testing
   */
  async getABTestResults(userProfileId?: string): Promise<ABTestResult[]> {
    try {
      const supabase = await getAuthenticatedClient();

      const profileId = userProfileId || await this.getUserProfileId();
      if (!profileId) return [];

      const { data, error } = await supabase
        .from('variant_performance')
        .select('*')
        .eq('user_profile_id', profileId);

      if (error) {
        console.error('Error fetching A/B test results:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        variant: row.cv_variant,
        totalApplications: row.total_sent,
        responses: row.total_responses,
        responseRate: row.response_rate,
        avgDaysToResponse: row.avg_days_to_response,
      }));
    } catch (err) {
      console.error('Error in getABTestResults:', err);
      return [];
    }
  }

  /**
   * Récupère la performance par variante (détaillée)
   */
  async getPerformanceByVariant(userProfileId?: string): Promise<VariantPerformance[]> {
    try {
      const supabase = await getAuthenticatedClient();

      const profileId = userProfileId || await this.getUserProfileId();
      if (!profileId) return [];

      const { data, error } = await supabase
        .from('variant_performance')
        .select('*')
        .eq('user_profile_id', profileId);

      if (error) {
        console.error('Error fetching variant performance:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in getPerformanceByVariant:', err);
      return [];
    }
  }

  /**
   * Récupère la performance par canal
   */
  async getPerformanceByChannel(userProfileId?: string): Promise<ChannelPerformance[]> {
    try {
      const supabase = await getAuthenticatedClient();

      const profileId = userProfileId || await this.getUserProfileId();
      if (!profileId) return [];

      const { data, error } = await supabase
        .from('channel_performance')
        .select('*')
        .eq('user_profile_id', profileId);

      if (error) {
        console.error('Error fetching channel performance:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in getPerformanceByChannel:', err);
      return [];
    }
  }

  /**
   * Récupère les données temporelles pour graphiques
   */
  async getTimeSeriesData(userProfileId?: string, weeks: number = 12): Promise<TimeSeriesData[]> {
    try {
      const supabase = await getAuthenticatedClient();

      const profileId = userProfileId || await this.getUserProfileId();
      if (!profileId) return [];

      const { data, error } = await supabase
        .from('time_series_stats')
        .select('*')
        .eq('user_profile_id', profileId)
        .order('week_start', { ascending: false })
        .limit(weeks);

      if (error) {
        console.error('Error fetching time series data:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in getTimeSeriesData:', err);
      return [];
    }
  }

  /**
   * Ajoute un événement à une candidature
   */
  async addEvent(
    applicationId: string,
    eventType: string,
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const supabase = await getAuthenticatedClient();

      const { error } = await supabase.from('application_events').insert({
        application_id: applicationId,
        event_type: eventType,
        metadata,
      });

      if (error) {
        console.error('Error adding event:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error in addEvent:', err);
      return false;
    }
  }

  /**
   * Récupère les événements d'une candidature
   */
  async getApplicationEvents(applicationId: string): Promise<ApplicationEvent[]> {
    try {
      const supabase = await getAuthenticatedClient();

      const { data, error } = await supabase
        .from('application_events')
        .select('*')
        .eq('application_id', applicationId)
        .order('event_timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in getApplicationEvents:', err);
      return [];
    }
  }

  /**
   * Supprime une candidature
   */
  async deleteApplication(applicationId: string): Promise<boolean> {
    try {
      const supabase = await getAuthenticatedClient();

      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);

      if (error) {
        console.error('Error deleting application:', error);
        return false;
      }

      // Rafraîchir les analytics
      await this.refreshAnalytics();

      return true;
    } catch (err) {
      console.error('Error in deleteApplication:', err);
      return false;
    }
  }

  /**
   * Rafraîchit les vues matérialisées
   */
  async refreshAnalytics(): Promise<boolean> {
    try {
      const supabase = await getAuthenticatedClient();

      const { error } = await supabase.rpc('refresh_analytics_views');

      if (error) {
        console.error('Error refreshing analytics:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error in refreshAnalytics:', err);
      return false;
    }
  }

  // ============================================================================
  // HELPERS PRIVÉS
  // ============================================================================

  private mapApplicationFromDB(data: any): Application {
    return {
      id: data.id,
      userId: data.user_profile_id,
      jobTitle: data.job_title,
      company: data.company,
      appliedDate: data.applied_date,
      cvVariant: data.cv_variant,
      letterVariant: data.letter_variant,
      channel: data.channel,
      status: data.status,
      responseDate: data.response_date,
      notes: data.notes,
    };
  }

  private mapStatusToEventType(status: ApplicationStatus): string | null {
    const mapping: Record<ApplicationStatus, string> = {
      pending: 'created',
      sent: 'sent',
      response_positive: 'response_received',
      response_negative: 'application_rejected',
      no_response: 'other',
      interview: 'interview_scheduled',
      offer: 'offer_received',
      rejected: 'application_rejected',
      ghosted: 'ghosted',
    };

    return mapping[status] || null;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
