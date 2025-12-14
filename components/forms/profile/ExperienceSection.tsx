
"use client";

import { useState } from "react";
import { Experience } from "@/lib/types";
import { ProfileService } from "@/lib/services/profile.service";
import { Briefcase, Plus, Pencil, Trash2, X, Calendar, MapPin } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExperienceSchema, ExperienceFormValues } from "@/lib/schemas/profile.schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ExperienceSectionProps {
    experiences: Experience[];
    userId: string;
    onRefresh: () => void;
}

export function ExperienceSection({ experiences, userId, onRefresh }: ExperienceSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer cette expérience ?")) {
            await ProfileService.deleteExperience(id);
            onRefresh();
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (exp: Experience) => {
        setEditingId(exp.id);
        setIsModalOpen(true);
    };

    return (
        <section className="glass-card">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <Briefcase className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold">Expérience</h2>
                </div>
                <button onClick={openAddModal} type="button" className="p-2 hover:bg-white/50 rounded-lg transition-colors text-primary">
                    <Plus className="h-5 w-5" />
                </button>
            </div>

            {experiences.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-300/50 rounded-2xl bg-white/20">
                    <Briefcase className="h-10 w-10 mx-auto text-gray-400 mb-3 opacity-50" />
                    <h3 className="text-sm font-medium text-gray-600">Aucune expérience ajoutée</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Ajoutez vos stages et emplois</p>
                    <button onClick={openAddModal} type="button" className="text-xs font-semibold px-4 py-2 rounded-lg bg-white/50 hover:bg-white transition-colors border border-gray-200">
                        Ajouter une expérience
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {experiences.map((exp) => (
                        <div key={exp.id} className="p-4 rounded-xl bg-white/40 border border-white/20 hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-gray-800">{exp.title}</h3>
                                    <div className="text-sm font-medium text-primary mt-0.5">{exp.company}</div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(exp.startDate), 'MMM yyyy', { locale: fr })} - {exp.endDate ? format(new Date(exp.endDate), 'MMM yyyy', { locale: fr }) : 'Présent'}
                                        </span>
                                        {exp.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {exp.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(exp)} className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-primary transition-colors">
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(exp.id)} className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                            <ul className="mt-3 space-y-1">
                                {exp.achievements.slice(0, 2).map((ach, i) => (
                                    <li key={i} className="text-xs text-gray-600 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400 line-clamp-1">
                                        {ach}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <ExperienceModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    userId={userId}
                    experienceId={editingId}
                    initialData={editingId ? experiences.find(e => e.id === editingId) : undefined}
                    onSuccess={() => { setIsModalOpen(false); onRefresh(); }}
                />
            )}
        </section>
    );
}

// ============================================================================
// MODAL COMPONENT
// ============================================================================

function ExperienceModal({ isOpen, onClose, userId, experienceId, initialData, onSuccess }: any) {
    const isEditing = !!experienceId;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ExperienceFormValues>({
        resolver: zodResolver(ExperienceSchema),
        defaultValues: initialData ? {
            title: initialData.title,
            company: initialData.company,
            location: initialData.location || "",
            startDate: initialData.startDate.split('T')[0],
            endDate: initialData.endDate ? initialData.endDate.split('T')[0] : "",
            current: !initialData.endDate,
            description: initialData.description || "",
            achievements: initialData.achievements ? initialData.achievements.map((a: string) => ({ value: a })) : [{ value: "" }],
        } : {
            title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "", achievements: [{ value: "" }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "achievements",
    });

    const onSubmit = async (data: ExperienceFormValues) => {
        setIsSubmitting(true);
        try {
            // Transform achievements to string array
            const payload = {
                ...data,
                achievements: data.achievements.map(a => a.value),
                endDate: data.current ? undefined : (data.endDate || undefined), // Fix: use undefined instead of null
                riskLevel: 'LOW' as const // Fix: strict literal type
            };

            if (isEditing) {
                await ProfileService.updateExperience(experienceId, payload);
            } else {
                await ProfileService.addExperience(userId, payload as any);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 backdrop-blur-md z-10">
                    <h3 className="text-lg font-bold text-gray-800">{isEditing ? "Modifier l'expérience" : "Ajouter une expérience"}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="h-5 w-5 text-gray-500" /></button>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du poste</label>
                            <input {...form.register("title")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="ex: Senior Developer" />
                            {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                            <input {...form.register("company")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                            {form.formState.errors.company && <p className="text-xs text-red-500">{form.formState.errors.company.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                            <input type="date" {...form.register("startDate")} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
                            {form.formState.errors.startDate && <p className="text-xs text-red-500">{form.formState.errors.startDate.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                            <input type="date" {...form.register("endDate")} disabled={form.watch("current")} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none disabled:opacity-50" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" {...form.register("current")} id="current" className="rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="current" className="text-sm text-gray-700">Je travaille actuellement ici</label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea {...form.register("description")} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Responsabilités principales..." />
                        {form.formState.errors.description && <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Réalisations clés (Bullet points)</label>
                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                    <input {...form.register(`achievements.${index}.value` as any)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm" placeholder="Ex: Réduit le temps de chargement de 50%" />
                                    <button type="button" onClick={() => remove(index)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => append({ value: "" })} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                                <Plus className="h-3 w-3" /> Ajouter une réalisation
                            </button>
                            {form.formState.errors.achievements && <p className="text-xs text-red-500">{form.formState.errors.achievements.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Annuler</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20 transition-all">
                            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
