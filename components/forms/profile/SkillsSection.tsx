
"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/types";
import { ProfileService } from "@/lib/services/profile.service";
import { Code2, Plus, Sparkles, Trash2, X } from "lucide-react";

interface SkillsSectionProps {
    initialSkills: UserProfile['skills']; // { technical: string[], business: string[], ... }
    userId: string;
    onRefresh: () => void;
}

export function SkillsSection({ initialSkills, userId, onRefresh }: SkillsSectionProps) {
    const [technicalSkills, setTechnicalSkills] = useState<string[]>(initialSkills?.technical || []);
    const [newSkill, setNewSkill] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleAddSkill = async () => {
        if (!newSkill.trim()) return;
        const updated = [...technicalSkills, newSkill.trim()];
        setTechnicalSkills(updated);
        setNewSkill("");
        setIsAdding(false);
        await saveSkills(updated);
    };

    const handleRemoveSkill = async (skillToRemove: string) => {
        const updated = technicalSkills.filter(s => s !== skillToRemove);
        setTechnicalSkills(updated);
        await saveSkills(updated);
    };

    const saveSkills = async (updatedTechnical: string[]) => {
        setIsSaving(true);
        try {
            const payload = {
                technical: updatedTechnical,
                business: initialSkills?.business || [],
                languages: initialSkills?.languages || []
            };
            await ProfileService.updateSkills(userId, payload);
            onRefresh();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="glass-card">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                        <Code2 className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold">Compétences Techniques</h2>
                </div>
                <button className="glass px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-white transition-colors">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    Auto-detect from CV
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {technicalSkills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 rounded-xl bg-white/40 border border-white/20 text-sm font-medium text-gray-700 hover:bg-white/60 transition-colors cursor-default flex items-center gap-2 group">
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity">
                            <Trash2 className="h-3 w-3" />
                        </button>
                    </span>
                ))}

                {isAdding ? (
                    <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                        <input
                            autoFocus
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                            className="px-3 py-1.5 rounded-xl border border-primary/50 text-sm outline-none w-32"
                            placeholder="React..."
                        />
                        <button onClick={handleAddSkill} className="p-1 hover:text-green-600"><Plus className="h-4 w-4" /></button>
                        <button onClick={() => setIsAdding(false)} className="p-1 hover:text-red-500"><X className="h-4 w-4" /></button>
                    </div>
                ) : (
                    <button onClick={() => setIsAdding(true)} className="px-3 py-1.5 rounded-xl border-2 border-dashed border-gray-300/60 text-sm font-medium text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center gap-1">
                        <Plus className="h-3 w-3" /> Ajouter
                    </button>
                )}
            </div>
            {isSaving && <div className="text-xs text-gray-400 mt-2 text-right">Sauvegarde...</div>}
        </section>
    );
}
