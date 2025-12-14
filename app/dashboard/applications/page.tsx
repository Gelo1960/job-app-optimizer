"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Briefcase,
  MapPin,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Link as LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/lib/types";

// Mock data generator for demo purposes if API fails or is empty
const MOCK_APPS: Application[] = [
  { id: '1', company: 'Airbnb', jobTitle: 'Senior Frontend Engineer', status: 'interview', appliedDate: '2023-10-15', location: 'Remote', logo: 'A' },
  { id: '2', company: 'Linear', jobTitle: 'Product Designer', status: 'pending', appliedDate: '2023-10-18', location: 'San Francisco', logo: 'L' },
  { id: '3', company: 'Stripe', jobTitle: 'Fullstack Developer', status: 'rejected', appliedDate: '2023-10-10', location: 'Dublin', logo: 'S' },
  { id: '4', company: 'Vercel', jobTitle: 'Developer Advocate', status: 'offer', appliedDate: '2023-10-20', location: 'Remote', logo: 'V' },
] as any;

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
          // Fallback to mock data for layout demonstration if empty
          setApplications(MOCK_APPS);
        }
      } catch (e) {
        console.error(e);
        setApplications(MOCK_APPS);
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

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Candidatures</h1>
          <p className="text-gray-500 mt-1">Gérez votre pipeline de recrutement</p>
        </div>
        <Button className="rounded-full bg-black text-white hover:bg-gray-800 shadow-lg shadow-gray-200">
          <Plus className="mr-2 h-4 w-4" /> Nouvelle candidature
        </Button>
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

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'pending', label: 'En attente' },
          { id: 'active', label: 'Actives' },
          { id: 'archived', label: 'Archivées' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-black text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Card List (iPhone Style) */}
      <div className="space-y-3">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="group relative bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              {/* Logo Placeholder */}
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 shrink-0">
                {app.company.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900 truncate pr-4">{app.jobTitle}</h3>
                    <p className="text-gray-500 font-medium text-sm">{app.company}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap font-medium">
                    {new Date(app.appliedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <span className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border", getStatusColor(app.status))}>
                    {getStatusLabel(app.status)}
                  </span>

                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="h-3 w-3" />
                    {app.location || "Remote"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredApps.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Aucune candidature trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
