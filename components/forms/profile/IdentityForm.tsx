
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IdentitySchema, IdentityFormValues } from "@/lib/schemas/profile.schema";
import { UserProfile } from "@/lib/types";
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, Save } from "lucide-react";
import { useState } from "react";
import { ProfileClientService } from "@/lib/services/profile.client.service";

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
            const { error } = await ProfileClientService.updateIdentity(userId, data);
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Details Card */}
            <section className="widget-card-hover space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-widget gradient-primary flex items-center justify-center text-white shadow-glow">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Identité</h2>
                            <p className="text-xs text-muted-foreground">Informations personnelles</p>
                        </div>
                    </div>
                    {successMsg && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full animate-in fade-in slide-in-from-top-2 duration-300">
                            <Save className="h-3 w-3" />
                            <span className="text-xs font-medium">{successMsg}</span>
                        </div>
                    )}
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

                <section className="widget-card-hover space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-widget gradient-sunset flex items-center justify-center text-white shadow-glow">
                            <Globe className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Réseaux</h2>
                            <p className="text-xs text-muted-foreground">Liens professionnels</p>
                        </div>
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
                        className="btn-gradient w-full mt-6 px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                        {isSaving ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Sauvegarde en cours...</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                <span>Sauvegarder les modifications</span>
                            </>
                        )}
                    </button>
                </section>
        </form>
    );
}
