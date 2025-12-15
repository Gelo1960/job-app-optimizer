
"use client";

import { useState } from "react";
import { Project } from "@/lib/types";
import { ProfileClientService } from "@/lib/services/profile.client.service";
import { Rocket, Plus, Pencil, Trash2, X, Calendar, ExternalLink, Github } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectSchema, ProjectFormValues } from "@/lib/schemas/profile.schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ProjectSectionProps {
    projects: Project[];
    userId: string;
    onRefresh: () => void;
}

const statusLabels = {
    live: { label: "En ligne", color: "bg-green-100 text-green-700" },
    development: { label: "En développement", color: "bg-blue-100 text-blue-700" },
    completed: { label: "Complété", color: "bg-purple-100 text-purple-700" },
    archived: { label: "Archivé", color: "bg-gray-100 text-gray-700" },
};

export function ProjectSection({ projects, userId, onRefresh }: ProjectSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer ce projet ?")) {
            await ProfileClientService.deleteProject(id);
            onRefresh();
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (proj: Project) => {
        setEditingId(proj.id);
        setIsModalOpen(true);
    };

    return (
        <section className="glass-card">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                        <Rocket className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold">Projets</h2>
                </div>
                <button onClick={openAddModal} type="button" className="p-2 hover:bg-white/50 rounded-lg transition-colors text-primary">
                    <Plus className="h-5 w-5" />
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-300/50 rounded-2xl bg-white/20">
                    <Rocket className="h-10 w-10 mx-auto text-gray-400 mb-3 opacity-50" />
                    <h3 className="text-sm font-medium text-gray-600">Aucun projet ajouté</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Ajoutez vos projets personnels et professionnels</p>
                    <button onClick={openAddModal} type="button" className="text-xs font-semibold px-4 py-2 rounded-lg bg-white/50 hover:bg-white transition-colors border border-gray-200">
                        Ajouter un projet
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {projects.map((proj) => (
                        <div key={proj.id} className="p-4 rounded-xl bg-white/40 border border-white/20 hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-800">{proj.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusLabels[proj.status].color}`}>
                                            {statusLabels[proj.status].label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{proj.description}</p>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {proj.tech.slice(0, 4).map((tech, i) => (
                                            <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                                                {tech}
                                            </span>
                                        ))}
                                        {proj.tech.length > 4 && (
                                            <span className="text-xs px-2 py-0.5 text-gray-500">
                                                +{proj.tech.length - 4}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(proj.startDate), 'MMM yyyy', { locale: fr })}
                                            {proj.endDate && ` - ${format(new Date(proj.endDate), 'MMM yyyy', { locale: fr })}`}
                                        </span>
                                        {proj.url && (
                                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                                                <ExternalLink className="h-3 w-3" /> Site
                                            </a>
                                        )}
                                        {proj.githubUrl && (
                                            <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                                                <Github className="h-3 w-3" /> GitHub
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(proj)} className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-primary transition-colors">
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(proj.id)} className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <ProjectModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    userId={userId}
                    projectId={editingId}
                    initialData={editingId ? projects.find(p => p.id === editingId) : undefined}
                    onSuccess={() => { setIsModalOpen(false); onRefresh(); }}
                />
            )}
        </section>
    );
}

// ============================================================================
// MODAL COMPONENT
// ============================================================================

function ProjectModal({ isOpen, onClose, userId, projectId, initialData, onSuccess }: any) {
    const isEditing = !!projectId;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(ProjectSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            description: initialData.description,
            status: initialData.status,
            tech: initialData.tech,
            url: initialData.url || "",
            githubUrl: initialData.githubUrl || "",
            startDate: initialData.startDate.split('T')[0],
            endDate: initialData.endDate ? initialData.endDate.split('T')[0] : "",
            highlights: initialData.highlights ? initialData.highlights.map((h: string) => ({ value: h })) : [{ value: "" }],
        } : {
            name: "",
            description: "",
            status: 'development' as const,
            tech: [],
            url: "",
            githubUrl: "",
            startDate: "",
            endDate: "",
            highlights: [{ value: "" }],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "highlights",
    });

    const [techInput, setTechInput] = useState("");
    const currentTech = form.watch("tech") || [];

    const addTech = () => {
        if (techInput.trim() && !currentTech.includes(techInput.trim())) {
            form.setValue("tech", [...currentTech, techInput.trim()]);
            setTechInput("");
        }
    };

    const removeTech = (tech: string) => {
        form.setValue("tech", currentTech.filter((t: string) => t !== tech));
    };

    const onSubmit = async (data: ProjectFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                highlights: data.highlights.map(h => h.value).filter(Boolean),
                endDate: data.endDate || undefined,
            };

            if (isEditing) {
                await ProfileClientService.updateProject(projectId, payload);
            } else {
                await ProfileClientService.addProject(userId, payload as any);
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
                    <h3 className="text-lg font-bold text-gray-800">{isEditing ? "Modifier le projet" : "Ajouter un projet"}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="h-5 w-5 text-gray-500" /></button>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du projet</label>
                            <input {...form.register("name")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="ex: Summer Dating App" />
                            {form.formState.errors.name && <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                            <select {...form.register("status")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none">
                                <option value="live">En ligne</option>
                                <option value="development">En développement</option>
                                <option value="completed">Complété</option>
                                <option value="archived">Archivé</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea {...form.register("description")} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Décrivez brièvement le projet..." />
                        {form.formState.errors.description && <p className="text-xs text-red-500 mt-1">{form.formState.errors.description.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Technologies utilisées</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                placeholder="Ex: React Native, TypeScript..."
                            />
                            <button type="button" onClick={addTech} className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 font-medium text-sm">
                                Ajouter
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {currentTech.map((tech: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
                                    {tech}
                                    <button type="button" onClick={() => removeTech(tech)} className="hover:text-red-500">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        {form.formState.errors.tech && <p className="text-xs text-red-500 mt-1">{form.formState.errors.tech.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL du projet</label>
                            <input {...form.register("url")} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                            <input {...form.register("githubUrl")} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm" placeholder="https://github.com/..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                            <input type="date" {...form.register("startDate")} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
                            {form.formState.errors.startDate && <p className="text-xs text-red-500 mt-1">{form.formState.errors.startDate.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin (optionnel)</label>
                            <input type="date" {...form.register("endDate")} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Points forts / KPIs</label>
                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                    <input {...form.register(`highlights.${index}.value` as any)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm" placeholder="Ex: 5000+ téléchargements en 2 mois" />
                                    <button type="button" onClick={() => remove(index)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => append({ value: "" })} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                                <Plus className="h-3 w-3" /> Ajouter un point fort
                            </button>
                            {form.formState.errors.highlights && <p className="text-xs text-red-500">{form.formState.errors.highlights.message}</p>}
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
