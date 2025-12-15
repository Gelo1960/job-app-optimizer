
"use client";

import { useState } from "react";
import { Education } from "@/lib/types";
import { ProfileClientService } from "@/lib/services/profile.client.service";
import { GraduationCap, Plus, Pencil, Trash2, X, Calendar, MapPin } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EducationSchema, EducationFormValues } from "@/lib/schemas/profile.schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface EducationSectionProps {
    education: Education[];
    userId: string;
    onRefresh: () => void;
}

export function EducationSection({ education, userId, onRefresh }: EducationSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer cette formation ?")) {
            await ProfileClientService.deleteEducation(id);
            onRefresh();
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (edu: Education) => {
        setEditingId(edu.id);
        setIsModalOpen(true);
    };

    return (
        <section className="glass-card">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold">Formation</h2>
                </div>
                <button onClick={openAddModal} type="button" className="p-2 hover:bg-white/50 rounded-lg transition-colors text-primary">
                    <Plus className="h-5 w-5" />
                </button>
            </div>

            {education.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-300/50 rounded-2xl bg-white/20">
                    <GraduationCap className="h-10 w-10 mx-auto text-gray-400 mb-3 opacity-50" />
                    <h3 className="text-sm font-medium text-gray-600">Aucune formation ajoutée</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Ajoutez vos diplômes et formations</p>
                    <button onClick={openAddModal} type="button" className="text-xs font-semibold px-4 py-2 rounded-lg bg-white/50 hover:bg-white transition-colors border border-gray-200">
                        Ajouter une formation
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {education.map((edu) => (
                        <div key={edu.id} className="p-4 rounded-xl bg-white/40 border border-white/20 hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                                    <div className="text-sm font-medium text-primary mt-0.5">{edu.institution}</div>
                                    <div className="text-xs text-gray-600 mt-1">{edu.field}</div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(edu.startDate), 'yyyy', { locale: fr })} - {format(new Date(edu.endDate), 'yyyy', { locale: fr })}
                                        </span>
                                        {edu.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {edu.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(edu)} className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-primary transition-colors">
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(edu.id)} className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                            {edu.highlights && edu.highlights.length > 0 && (
                                <ul className="mt-3 space-y-1">
                                    {edu.highlights.slice(0, 2).map((highlight, i) => (
                                        <li key={i} className="text-xs text-gray-600 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400 line-clamp-1">
                                            {highlight}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <EducationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    userId={userId}
                    educationId={editingId}
                    initialData={editingId ? education.find(e => e.id === editingId) : undefined}
                    onSuccess={() => { setIsModalOpen(false); onRefresh(); }}
                />
            )}
        </section>
    );
}

// ============================================================================
// MODAL COMPONENT
// ============================================================================

function EducationModal({ isOpen, onClose, userId, educationId, initialData, onSuccess }: any) {
    const isEditing = !!educationId;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<EducationFormValues>({
        resolver: zodResolver(EducationSchema),
        defaultValues: initialData ? {
            degree: initialData.degree,
            institution: initialData.institution,
            field: initialData.field,
            location: initialData.location || "",
            startDate: initialData.startDate.split('T')[0],
            endDate: initialData.endDate ? initialData.endDate.split('T')[0] : "",
            current: !initialData.endDate,
            highlights: initialData.highlights ? initialData.highlights.map((h: string) => ({ value: h })) : [],
        } : {
            degree: "",
            institution: "",
            field: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            highlights: [],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "highlights",
    });

    const onSubmit = async (data: EducationFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                highlights: data.highlights ? data.highlights.map(h => h.value).filter(Boolean) : [],
                endDate: data.current ? undefined : (data.endDate || undefined),
            };

            if (isEditing) {
                await ProfileClientService.updateEducation(educationId, payload);
            } else {
                await ProfileClientService.addEducation(userId, payload as any);
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
                    <h3 className="text-lg font-bold text-gray-800">{isEditing ? "Modifier la formation" : "Ajouter une formation"}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="h-5 w-5 text-gray-500" /></button>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Diplôme</label>
                            <input {...form.register("degree")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="ex: Master en Informatique" />
                            {form.formState.errors.degree && <p className="text-xs text-red-500 mt-1">{form.formState.errors.degree.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Établissement</label>
                            <input {...form.register("institution")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="ex: Université Paris-Saclay" />
                            {form.formState.errors.institution && <p className="text-xs text-red-500 mt-1">{form.formState.errors.institution.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Domaine</label>
                            <input {...form.register("field")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="ex: Intelligence Artificielle" />
                            {form.formState.errors.field && <p className="text-xs text-red-500 mt-1">{form.formState.errors.field.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ville (optionnel)</label>
                            <input {...form.register("location")} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" placeholder="ex: Paris" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                            <input type="date" {...form.register("startDate")} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
                            {form.formState.errors.startDate && <p className="text-xs text-red-500 mt-1">{form.formState.errors.startDate.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                            <input type="date" {...form.register("endDate")} disabled={form.watch("current")} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none disabled:opacity-50" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" {...form.register("current")} id="current-edu" className="rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="current-edu" className="text-sm text-gray-700">Formation en cours</label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Points forts / Distinctions (optionnel)</label>
                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                    <input {...form.register(`highlights.${index}.value` as any)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm" placeholder="Ex: Major de promotion, Mention Très Bien" />
                                    <button type="button" onClick={() => remove(index)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => append({ value: "" })} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                                <Plus className="h-3 w-3" /> Ajouter un point fort
                            </button>
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
