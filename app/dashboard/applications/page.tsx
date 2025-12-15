"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Briefcase,
  MapPin,
  Building2,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/lib/types";


export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'archived'>('all');

  useEffect(() => {
    // Fetch real data
    async function fetchData() {
      try {
        const res = await fetch("/api/analytics/applications");
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          setApplications(data.data);
        } else {
          setApplications([]);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des candidatures:', e);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredApps = applications.filter(app => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return app.status === 'pending' || app.status === 'sent';
    if (activeTab === 'active') return ['interview', 'offer', 'response_positive'].includes(app.status);
    if (activeTab === 'archived') return ['rejected', 'ghosted', 'response_negative'].includes(app.status);

    return true;
  });

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'offer': return "bg-green-100 text-green-700 border-green-200";
      case 'interview': return "bg-purple-100 text-purple-700 border-purple-200";
      case 'rejected': return "bg-red-50 text-red-600 border-red-100";
      case 'pending': return "bg-orange-50 text-orange-600 border-orange-100";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case 'offer': return "Offre Reçue";
      case 'interview': return "Entretien";
      case 'rejected': return "Refusé";
      case 'pending': return "En attente";
      case 'sent': return "Envoyé";
      case 'ghosted': return "Sans réponse";
      default: return status;
    }
  };

  // Calcul des statistiques
  const stats = {
    total: applications.length,
    pending: applications.filter(a => ['pending', 'sent'].includes(a.status)).length,
    active: applications.filter(a => ['interview', 'offer', 'response_positive'].includes(a.status)).length,
    archived: applications.filter(a => ['rejected', 'ghosted', 'response_negative'].includes(a.status)).length,
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header avec statistiques */}
      <div className="relative overflow-hidden rounded-3xl p-8 glass-card">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Candidatures</h1>
            <p className="text-muted-foreground text-lg">Suivez votre pipeline de recrutement en temps réel</p>
          </div>

          {/* Stats rapides */}
          <div className="flex items-center gap-4">
            <div className="text-center px-4 py-2 rounded-widget bg-white/50 backdrop-blur-sm">
              <div className="text-3xl font-bold text-gradient">{stats.total}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Total</div>
            </div>
            <div className="text-center px-4 py-2 rounded-widget bg-orange-50/50 backdrop-blur-sm">
              <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">En attente</div>
            </div>
            <div className="text-center px-4 py-2 rounded-widget bg-green-50/50 backdrop-blur-sm">
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Actives</div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="relative z-10 mt-6">
          <Button className="btn-gradient gap-2 hover:scale-105 active:scale-95 transition-transform">
            <Plus className="h-4 w-4" /> Nouvelle candidature
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="sticky top-0 z-10 glass-panel p-2 rounded-2xl flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une entreprise, un poste..."
            className="pl-9 border-none bg-transparent shadow-none focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="h-6 w-px bg-gray-200 mx-2"></div>
        <Button variant="ghost" size="icon" className="text-gray-500 rounded-xl hover:bg-gray-100">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs améliorés */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'all', label: 'Toutes', count: stats.total },
          { id: 'pending', label: 'En attente', count: stats.pending },
          { id: 'active', label: 'Actives', count: stats.active },
          { id: 'archived', label: 'Archivées', count: stats.archived }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'all' | 'pending' | 'active' | 'archived')}
            className={cn(
              "px-5 py-2.5 rounded-button text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2",
              activeTab === tab.id
                ? "btn-gradient shadow-lg"
                : "glass-card hover:bg-white/60 text-muted-foreground"
            )}
          >
            {tab.label}
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              activeTab === tab.id
                ? "bg-white/20 text-white"
                : "bg-primary/10 text-primary"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Card List avec animations staggered */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="widget-card animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-widget bg-gray-200"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-100 rounded w-20"></div>
                      <div className="h-6 bg-gray-100 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          filteredApps.map((app, index) => (
            <div
              key={app.id}
              className="widget-card-hover group relative cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-500"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Logo avec gradient */}
                <div className="h-14 w-14 rounded-widget gradient-primary flex items-center justify-center text-xl font-bold text-white shadow-glow shrink-0">
                  {app.company.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-foreground text-lg truncate pr-4 group-hover:text-gradient transition-all">
                        {app.jobTitle}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-muted-foreground font-medium text-sm">{app.company}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground whitespace-nowrap font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(app.appliedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <span className={cn(
                      "px-3 py-1.5 rounded-button text-xs font-bold border shadow-soft",
                      getStatusColor(app.status)
                    )}>
                      {getStatusLabel(app.status)}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {app.location || "Remote"}
                    </div>

                  </div>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MoreHorizontal className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
          ))
        )}

        {!isLoading && filteredApps.length === 0 && (
          <div className="text-center py-20 glass-card rounded-3xl">
            <div className="inline-flex h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucune candidature trouvée</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery
                ? "Essayez de modifier votre recherche"
                : "Commencez à ajouter vos candidatures"}
            </p>
            {!searchQuery && (
              <Button className="btn-gradient gap-2">
                <Plus className="h-4 w-4" /> Ajouter ma première candidature
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
