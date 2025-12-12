"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatsCards } from "@/components/analytics/StatsCards";
import { ApplicationsTable } from "@/components/analytics/ApplicationsTable";
import type { Application, ApplicationStatus } from "@/lib/types";
import type { ApplicationStats } from "@/lib/services/analytics.service";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

  // Form state for new application
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    jobUrl: "",
    cvVariant: "",
    channel: "linkedin" as const,
    appliedDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Fetch user profile ID
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        // TODO: Replace with actual auth call
        // For now, we'll use a placeholder
        const mockProfileId = "00000000-0000-0000-0000-000000000000";
        setUserProfileId(mockProfileId);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
    fetchUserProfile();
  }, []);

  // Fetch applications and stats
  useEffect(() => {
    async function fetchData() {
      if (!userProfileId) return;

      setIsLoading(true);
      try {
        // Fetch applications
        const appsResponse = await fetch("/api/analytics/applications");
        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          setApplications(appsData.data || []);
        }

        // Fetch stats
        const statsResponse = await fetch("/api/analytics/stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data?.overview || null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userProfileId]);

  // Handle status update
  const handleUpdateStatus = async (id: string, status: ApplicationStatus) => {
    try {
      const response = await fetch(`/api/analytics/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          responseDate:
            status !== "pending" ? new Date().toISOString().split("T")[0] : undefined,
        }),
      });

      if (response.ok) {
        // Refresh data
        const appsResponse = await fetch("/api/analytics/applications");
        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          setApplications(appsData.data || []);
        }

        const statsResponse = await fetch("/api/analytics/stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data?.overview || null);
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/analytics/applications/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setApplications((prev) => prev.filter((app) => app.id !== id));
        // Refresh stats
        const statsResponse = await fetch("/api/analytics/stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data?.overview || null);
        }
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfileId) {
      alert("Erreur: profil utilisateur non trouvé");
      return;
    }

    try {
      const response = await fetch("/api/analytics/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfileId,
          ...formData,
        }),
      });

      if (response.ok) {
        // Reset form and close dialog
        setFormData({
          jobTitle: "",
          company: "",
          jobUrl: "",
          cvVariant: "",
          channel: "linkedin",
          appliedDate: new Date().toISOString().split("T")[0],
          notes: "",
        });
        setIsDialogOpen(false);

        // Refresh data
        const appsResponse = await fetch("/api/analytics/applications");
        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          setApplications(appsData.data || []);
        }

        const statsResponse = await fetch("/api/analytics/stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data?.overview || null);
        }
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating application:", error);
      alert("Erreur lors de la création de la candidature");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes candidatures</h1>
          <p className="text-gray-600 mt-2">
            Suivez toutes vos candidatures et leur statut
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nouvelle candidature</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enregistrer une nouvelle candidature</DialogTitle>
              <DialogDescription>
                Ajoutez les détails de votre candidature pour suivre son évolution
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Poste *</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, jobTitle: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobUrl">URL de l'offre</Label>
                  <Input
                    id="jobUrl"
                    type="url"
                    value={formData.jobUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, jobUrl: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cvVariant">Variante de CV *</Label>
                    <Select
                      value={formData.cvVariant}
                      onValueChange={(value) =>
                        setFormData({ ...formData, cvVariant: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile_developer">Mobile Developer</SelectItem>
                        <SelectItem value="product_developer">Product Developer</SelectItem>
                        <SelectItem value="project_manager">Project Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="channel">Canal *</Label>
                    <Select
                      value={formData.channel}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, channel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="direct_email">Email direct</SelectItem>
                        <SelectItem value="company_website">Site entreprise</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appliedDate">Date d'envoi *</Label>
                  <Input
                    id="appliedDate"
                    type="date"
                    value={formData.appliedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, appliedDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    className="w-full min-h-20 px-3 py-2 border rounded-md"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} isLoading={isLoading} />

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des candidatures</CardTitle>
          <CardDescription>Historique complet de vos candidatures</CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationsTable
            applications={applications}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
