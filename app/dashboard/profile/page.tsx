"use client"

import { useState, useEffect } from "react";
import { IdentityForm } from "@/components/forms/profile/IdentityForm";
import { ExperienceSection } from "@/components/forms/profile/ExperienceSection";
import { SkillsSection } from "@/components/forms/profile/SkillsSection";
import { ProfileService } from "@/lib/services/profile.service";
import { UserProfile } from "@/lib/types";
import { GraduationCap, Briefcase } from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await ProfileService.getFullProfile(user.id);
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
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin text-4xl">⏳</div></div>;
  }

  // If no profile exists yet (first login), use empty default
  const userProfile = profile || {} as UserProfile;

  return (
    <div className="space-y-8 pb-20">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          Mon Profil
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez votre identité professionnelle et vos expériences
        </p>
      </div>

      {/* Identity Form (includes Left Column) */}
      <IdentityForm
        userId={user?.id || ''}
        initialData={userProfile}
      />

      {/* Since IdentityForm is a grid, we "portal" these sections into its right column placeholder using CSS grid or structure here? 
          Actually, IdentityForm structure was: Left Col (Form) | Right Col (Empty).
          Looking at my implementation of IdentityForm, it WRAPS the grid. 
          Wait, the IdentityForm renders the FORM tag which wraps the whole layout.
          Ideally, IdentityForm should only handle Identity data.
          
          Let's Refactor slightly: IdentityForm will just be the "Identity" card.
          But wait, the previous layout had Left Col (Identity + Socials) and Right Col (Exp + Edu + Skills).
          
          Let's adjust the structure in this page to match the original layout, 
          passing the Sections as children or siblings. 
      */}

      {/* 
        Correction: My IdentityForm implementation integrated the Layout. 
        It has a hidden div id="profile-right-column". 
        This is a bit messy. 
        
        BETTER APPROACH for this file:
        Use the same layout grid here.
        - Left Column: <IdentityForm /> (which I should refactor to NOT be a full page grid, but just the left column content)
        - Right Column: <ExperienceSection />, <SkillsSection />
        
        However, IdentityForm currently has the <form> tag wrapping everything.
        If I want to stick to the plan:
        I will modify IdentityForm in the next step to be self-contained or
        I will render the Right Column content here and use React Portals or just standard CSS Grid if I separate the form.
        
        Let's assume the user wants me to fix the Page first. 
        I'll render the components and then I might need to quick-fix IdentityForm to not be a full grid if it looks broken.
        
        Actually, let's look at IdentityForm again. It renders:
        <form className="grid ...">
          <div className="lg:col-span-1">...fields...</div>
          <div className="lg:col-span-2 ... hidden"></div>
        </form>
        
        This is not ideal for composition. 
        To make it work nicely without refactoring IdentityForm yet:
        I will use a layout here and just place IdentityForm in the Left Slot? 
        No, IdentityForm creates the grid.
        
        Let's render the IdentityForm, and use a Portal or just absolute positioning? No that's hacky.
        
        DECISION: I will assume I need to Refactor IdentityForm to NOT be the layout container, 
        OR I will use a different layout strategy.
        
        Actually, looking at the previous file content I see:
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div LeftCol>...</div>
           <div RightCol>...</div>
        </div>

        I will Re-implement the Grid HERE.
        And I will change IdentityForm usage. 
        I will wrap IdentityForm in the Left Column.
        Wait, IdentityForm uses `useForm` and submits `firstName`, etc.
        It should only wrap the Identity inputs.
        
        So I will use the code below ensuring the Grid is controlled by THIS page.
        I will need to patch IdentityForm to remove the `grid` class from the form tag if it conflicts.
      */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Identity & Socials */}
        <div className="lg:col-span-1">
          <IdentityForm userId={user?.id || ''} initialData={userProfile} />
        </div>

        {/* Right Column: Experience, Education, Skills */}
        <div className="lg:col-span-2 space-y-6">

          <ExperienceSection
            userId={user?.id || ''}
            experiences={userProfile.experiences || []}
            onRefresh={fetchProfile}
          />

          {/* Education - Placeholder using Experience styling for now or duplicate component later */}
          <section className="glass-card opacity-75">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">Education (Coming Soon)</h2>
            </div>
            <p className="text-sm text-gray-500">Section en cours de développement...</p>
          </section>

          <SkillsSection
            userId={user?.id || ''}
            initialSkills={userProfile.skills}
            onRefresh={fetchProfile}
          />

        </div>
      </div>

    </div>
  );
}

