
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IdentitySchema, IdentityFormValues } from "@/lib/schemas/profile.schema";
import { UserProfile } from "@/lib/types";
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, Save } from "lucide-react";
import { useState } from "react";
import { ProfileService } from "@/lib/services/profile.service";

interface IdentityFormProps {
    initialData: Partial<UserProfile>;
    userId: string;
}

export function IdentityForm({ initialData, userId }: IdentityFormProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const form = useForm<IdentityFormValues>({
        resolver: zodResolver(IdentitySchema),
        defaultValues: {
            firstName: initialData.firstName || "",
            lastName: initialData.lastName || "",
            email: initialData.email || "",
            phone: initialData.phone || "",
            location: initialData.location || "",
            targetRole: initialData.targetRole || "",
            linkedinUrl: initialData.linkedinUrl || "",
            githubUrl: initialData.githubUrl || "",
            portfolioUrl: initialData.portfolioUrl || "",
        },
    });

    const onSubmit = async (data: IdentityFormValues) => {
        setIsSaving(true);
        setSuccessMsg("");
        try {
            const { error } = await ProfileService.updateIdentity(userId, data);
            if (error) throw error;
            setSuccessMsg("Profil mis à jour !");
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col - Personal Details */}
            <div className="lg:col-span-1 space-y-6">
                <section className="glass-card space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <User className="h-5 w-5" />
                            </div>
                            <h2 className="text-xl font-semibold">Identité</h2>
                        </div>
                        {successMsg && <span className="text-xs text-green-600 font-medium">{successMsg}</span>}
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground ml-1">Prénom</label>
                                <input {...form.register("firstName")} className="w-full px-4 py-2 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                {form.formState.errors.firstName && <p className="text-xs text-red-500 mt-1">{form.formState.errors.firstName.message}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground ml-1">Nom</label>
                                <input {...form.register("lastName")} className="w-full px-4 py-2 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                {form.formState.errors.lastName && <p className="text-xs text-red-500 mt-1">{form.formState.errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground ml-1">Poste visé</label>
                            <input {...form.register("targetRole")} placeholder="ex: Senior React Developer" className="w-full px-4 py-2 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input {...form.register("email")} type="email" className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                            </div>
                            {form.formState.errors.email && <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground ml-1">Téléphone</label>
                            <div className="relative mt-1">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input {...form.register("phone")} type="tel" className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground ml-1">Localisation</label>
                            <div className="relative mt-1">
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input {...form.register("location")} className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="glass-card space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                            <Globe className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-semibold">Réseaux</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="relative group">
                            <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-blue-600" />
                            <input {...form.register("linkedinUrl")} placeholder="LinkedIn URL" className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                            {form.formState.errors.linkedinUrl && <p className="text-xs text-red-500 mt-1">{form.formState.errors.linkedinUrl.message}</p>}
                        </div>

                        <div className="relative group">
                            <Github className="absolute left-3 top-2.5 h-4 w-4 text-gray-800" />
                            <input {...form.register("githubUrl")} placeholder="GitHub URL" className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                            {form.formState.errors.githubUrl && <p className="text-xs text-red-500 mt-1">{form.formState.errors.githubUrl.message}</p>}
                        </div>

                        <div className="relative group">
                            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                            <input {...form.register("portfolioUrl")} placeholder="Portfolio URL" className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                            {form.formState.errors.portfolioUrl && <p className="text-xs text-red-500 mt-1">{form.formState.errors.portfolioUrl.message}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full mt-4 glass px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/25 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <span className="animate-spin">⏳</span> : <Save className="h-4 w-4" />}
                        {isSaving ? "Sauvegarde..." : "Sauvegarder Identité"}
                    </button>
                </section>
            </div>

            {/* Right Column slot (will be filled by other components in parent) */}
            <div id="profile-right-column" className="lg:col-span-2 space-y-6 hidden"></div>
        </form>
    );
}
