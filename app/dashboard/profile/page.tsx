"use client"

import { useState, useEffect } from "react";
import { IdentityForm } from "@/components/forms/profile/IdentityForm";
import { ExperienceSection } from "@/components/forms/profile/ExperienceSection";
import { EducationSection } from "@/components/forms/profile/EducationSection";
import { ProjectSection } from "@/components/forms/profile/ProjectSection";
import { SkillsSection } from "@/components/forms/profile/SkillsSection";
import { ProfileClientService } from "@/lib/services/profile.client.service";
import { UserProfile } from "@/lib/types";
import { useAuth } from "@/lib/context/auth-context";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await ProfileClientService.getFullProfile(user.id);
    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchProfile();
    }
  }, [authLoading, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <div className="absolute inset-0 h-20 w-20 rounded-full bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-xl"></div>
        </div>
        <p className="text-muted-foreground text-sm animate-pulse">Chargement de votre profil...</p>
      </div>
    );
  }

  // If no profile exists yet (first login), use empty default
  const userProfile = profile || {} as UserProfile;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header avec statistiques */}
      <div className="relative overflow-hidden rounded-3xl p-8 glass-card">
        {/* Background gradient subtil */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              {userProfile.firstName && userProfile.lastName
                ? `${userProfile.firstName} ${userProfile.lastName}`
                : "Mon Profil"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {userProfile.targetRole || "Définissez votre poste visé"}
            </p>
          </div>

          {/* Stats rapides */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">{(userProfile.projects || []).length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Projets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">{(userProfile.experiences || []).length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Expériences</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">{(userProfile.education || []).length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Diplômes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Identity & Socials */}
        <div className="lg:col-span-1">
          <IdentityForm userId={user?.id || ''} initialData={userProfile} />
        </div>

        {/* Right Column: Projects, Experience, Education, Skills */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section avec animation staggered */}
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700" style={{ animationDelay: '100ms' }}>
            <ProjectSection
              userId={user?.id || ''}
              projects={userProfile.projects || []}
              onRefresh={fetchProfile}
            />
          </div>

          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700" style={{ animationDelay: '200ms' }}>
            <ExperienceSection
              userId={user?.id || ''}
              experiences={userProfile.experiences || []}
              onRefresh={fetchProfile}
            />
          </div>

          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700" style={{ animationDelay: '300ms' }}>
            <EducationSection
              userId={user?.id || ''}
              education={userProfile.education || []}
              onRefresh={fetchProfile}
            />
          </div>

          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700" style={{ animationDelay: '400ms' }}>
            <SkillsSection
              userId={user?.id || ''}
              initialSkills={userProfile.skills}
              onRefresh={fetchProfile}
            />
          </div>

        </div>
      </div>

    </div>
  );
}

