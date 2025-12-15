"use client"

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Application, ApplicationStatus } from "@/lib/types";

interface ApplicationsTableProps {
  applications: Application[];
  onUpdateStatus?: (id: string, status: ApplicationStatus) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const statusLabels: Record<ApplicationStatus, { label: string; variant: any }> = {
  pending: { label: "En attente", variant: "outline" },
  sent: { label: "Envoyée", variant: "secondary" },
  response_positive: { label: "Positive", variant: "default" },
  response_negative: { label: "Négative", variant: "destructive" },
  no_response: { label: "Pas de réponse", variant: "outline" },
  interview: { label: "Entretien", variant: "default" },
  offer: { label: "Offre reçue", variant: "success" },
  rejected: { label: "Rejeté", variant: "destructive" },
  ghosted: { label: "Ghosté", variant: "outline" },
};

const channelLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  direct_email: "Email",
  company_website: "Site",
  other: "Autre",
};

export function ApplicationsTable({
  applications,
  onUpdateStatus,
  onDelete,
  isLoading = false,
}: ApplicationsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-gray-500">
        <div className="text-6xl mb-4">📋</div>
        <p className="text-lg font-medium mb-2">Aucune candidature enregistrée</p>
        <p className="text-sm">
          Commencez par générer un CV et enregistrez vos candidatures
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entreprise</TableHead>
            <TableHead>Poste</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Variante</TableHead>
            <TableHead>Canal</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Réponse</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id} className="cursor-pointer hover:bg-gray-50">
              <TableCell className="font-medium">{app.company}</TableCell>
              <TableCell className="max-w-xs truncate">{app.jobTitle}</TableCell>
              <TableCell>
                {format(new Date(app.appliedDate), "dd MMM yyyy", { locale: fr })}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {app.cvVariant}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {channelLabels[app.channel] || app.channel}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={statusLabels[app.status].variant}>
                  {statusLabels[app.status].label}
                </Badge>
              </TableCell>
              <TableCell>
                {app.responseDate ? (
                  <span className="text-sm text-gray-600">
                    {format(new Date(app.responseDate), "dd MMM", { locale: fr })}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                {onUpdateStatus && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRow(app.id)}
                  >
                    {expandedRows.has(app.id) ? "Fermer" : "Modifier"}
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (confirm("Supprimer cette candidature ?")) {
                        onDelete(app.id);
                      }
                    }}
                  >
                    Supprimer
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Expanded row details for status updates */}
      {Array.from(expandedRows).map((id) => {
        const app = applications.find((a) => a.id === id);
        if (!app || !onUpdateStatus) return null;

        return (
          <div key={`expanded-${id}`} className="border-t bg-gray-50 p-4">
            <div className="max-w-2xl">
              <h4 className="font-medium mb-3">Mettre à jour le statut</h4>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(statusLabels).map(([status, { label, variant }]) => (
                  <Button
                    key={status}
                    variant={app.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      onUpdateStatus(app.id, status as ApplicationStatus);
                      toggleRow(id);
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              {app.notes && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-600">{app.notes}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
