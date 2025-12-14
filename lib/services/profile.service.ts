
import { supabase } from '@/lib/db/supabase';
import { UserProfile, Experience, Education, Project } from '@/lib/types';
import { PostgrestError } from '@supabase/supabase-js';

export class ProfileService {

    static async getFullProfile(userId: string): Promise<{ data: UserProfile | null; error: PostgrestError | null }> {
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return { data: null, error: profileError };
        }

        // Fetch relations in parallel
        const [experiences, education, projects, skills] = await Promise.all([
            supabase.from('experiences').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
            supabase.from('education').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
            supabase.from('projects').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
            supabase.from('skills').select('*').eq('user_id', userId).single(),
        ]);

        const fullProfile: UserProfile = {
            ...profile,
            experiences: experiences.data || [],
            education: education.data || [],
            projects: projects.data || [],
            skills: skills.data ? skills.data : { technical: [], business: [], languages: [] },
        };

        return { data: fullProfile, error: null };
    }

    // UPDATE IDENTITY
    static async updateIdentity(userId: string, data: Partial<UserProfile>) {
        return await supabase
            .from('user_profiles')
            .update(data)
            .eq('id', userId);
    }

    // EXPERIENCES
    static async addExperience(userId: string, experience: Omit<Experience, 'id'>) {
        return await supabase
            .from('experiences')
            .insert({ ...experience, user_id: userId });
    }

    static async updateExperience(id: string, experience: Partial<Experience>) {
        return await supabase
            .from('experiences')
            .update(experience)
            .eq('id', id);
    }

    static async deleteExperience(id: string) {
        return await supabase
            .from('experiences')
            .delete()
            .eq('id', id);
    }

    // EDUCATION
    static async addEducation(userId: string, education: Omit<Education, 'id'>) {
        return await supabase
            .from('education')
            .insert({ ...education, user_id: userId });
    }

    static async updateEducation(id: string, education: Partial<Education>) {
        return await supabase
            .from('education')
            .update(education)
            .eq('id', id);
    }

    static async deleteEducation(id: string) {
        return await supabase
            .from('education')
            .delete()
            .eq('id', id);
    }

    // PROJECTS
    static async addProject(userId: string, project: Omit<Project, 'id'>) {
        return await supabase
            .from('projects')
            .insert({ ...project, user_id: userId });
    }

    static async updateProject(id: string, project: Partial<Project>) {
        return await supabase
            .from('projects')
            .update(project)
            .eq('id', id);
    }

    static async deleteProject(id: string) {
        return await supabase
            .from('projects')
            .delete()
            .eq('id', id);
    }

    // SKILLS
    static async updateSkills(userId: string, skills: any) {
        // Check if skills exist for user
        const { data: existing } = await supabase.from('skills').select('id').eq('user_id', userId).single();

        if (existing) {
            return await supabase.from('skills').update(skills).eq('user_id', userId);
        } else {
            return await supabase.from('skills').insert({ ...skills, user_id: userId });
        }
    }
}
