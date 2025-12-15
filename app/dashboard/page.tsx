'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  MoreVertical,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Bold,
  Italic,
  Underline,
  PenLine
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalyzeOverlay } from "@/components/dashboard/AnalyzeOverlay";
import { GenerateOverlay } from "@/components/dashboard/GenerateOverlay";

interface DashboardStats {
  totalApplications: number;
  totalResponses: number;
  positiveResponses: number;
  negativeResponses: number;
  noResponses: number;
  responseRate: number;
  totalInterviews: number;
}

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Overlay State (SPA Architecture)
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'analyze' | 'generate'>('none');

  // Quick Note State
  const [note, setNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Reminder State
  const [reminder, setReminder] = useState("Focus on your applications!");
  const [isEditingReminder, setIsEditingReminder] = useState(false);
  const [tempReminder, setTempReminder] = useState("");

  useEffect(() => {
    // 1. Time Update
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);

    // 2. Fetch Stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics/stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.data.overview);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    // 3. Load from LocalStorage
    const savedNote = localStorage.getItem('dashboard_quick_note');
    if (savedNote) setNote(savedNote);

    const savedReminder = localStorage.getItem('dashboard_reminder');
    if (savedReminder) setReminder(savedReminder);

    return () => clearInterval(interval);
  }, []);

  // Quick Note Auto-save logic
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('dashboard_quick_note', note);
      if (note) setIsSavingNote(false); // Saved
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [note]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    setIsSavingNote(true);
  };

  const handleCreateReminder = () => {
    setTempReminder(reminder);
    setIsEditingReminder(true);
  };

  const saveReminder = () => {
    setReminder(tempReminder);
    localStorage.setItem('dashboard_reminder', tempReminder);
    setIsEditingReminder(false);
    // Visual feedback
  };

  // Calculated Stats
  const activeApplications = stats ? stats.totalApplications - stats.negativeResponses : 0;

  return (
    <div className="relative min-h-[calc(100vh-4rem)]"> {/* Main container */}

      {/* Background Content (Dashboard) - Blurs when overlay is active */}
      <div className={cn(
        "grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8 transition-all duration-500 ease-in-out",
        activeOverlay !== 'none' ? "blur-xl scale-[0.98] opacity-50 overflow-hidden h-[calc(100vh-4rem)]" : ""
      )}>
        {/* Colonne Principale (2/3) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Overview Header */}
          <div className="widget-card-hover relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <button className="p-2 hover:bg-accent rounded-full transition-colors">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-start gap-6">
              <div className="h-24 w-24 rounded-widget gradient-primary flex items-center justify-center shadow-glow text-white shrink-0">
                <Briefcase className="h-10 w-10" />
              </div>

              <div className="flex-1 pt-2">
                <div className="text-xs font-bold text-gradient tracking-wider uppercase mb-1">OVERVIEW</div>
                <h1 className="text-3xl font-bold text-foreground mb-4">My Applications</h1>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 group cursor-help" title="Total Applications Sent">
                    <div className="p-1.5 rounded-input bg-secondary group-hover:bg-accent transition-colors">
                      <FileText className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <span className="font-semibold text-foreground">{loading ? '-' : stats?.totalApplications || 0}</span>
                    <span className="text-muted-foreground">Applied</span>
                  </div>

                  <div className="flex items-center gap-2 group cursor-help" title="Active (Not Rejected)">
                    <div className="p-1.5 rounded-input bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="font-semibold text-foreground">{loading ? '-' : activeApplications}</span>
                    <span className="text-muted-foreground">Active</span>
                  </div>

                  <div className="flex items-center gap-2 group cursor-help" title="Positive Responses">
                    <div className="p-1.5 rounded-input bg-green-50 group-hover:bg-green-100 transition-colors">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-semibold text-foreground">{loading ? '-' : stats?.positiveResponses || 0}</span>
                    <span className="text-muted-foreground">Offers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Functional Status Pills (Filters) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Status Example</h3>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard/applications?status=pending">
                <div className="px-4 py-2 rounded-button bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-2 text-sm font-medium hover:bg-orange-100 transition-all cursor-pointer shadow-soft">
                  <Clock className="h-4 w-4" /> Pending
                </div>
              </Link>
              <Link href="/dashboard/applications?status=sent">
                <div className="px-4 py-2 rounded-button bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-2 text-sm font-medium hover:bg-blue-100 transition-all cursor-pointer shadow-soft">
                  <Loader2 className="h-4 w-4" /> Sent
                </div>
              </Link>
              <Link href="/dashboard/applications?status=response_positive">
                <div className="px-4 py-2 rounded-button bg-green-50 text-green-600 border border-green-100 flex items-center gap-2 text-sm font-medium hover:bg-green-100 transition-all cursor-pointer shadow-soft">
                  <CheckCircle2 className="h-4 w-4" /> Positive
                </div>
              </Link>
              <Link href="/dashboard/applications?status=response_negative">
                <div className="px-4 py-2 rounded-button bg-red-50 text-red-600 border border-red-100 flex items-center gap-2 text-sm font-medium hover:bg-red-100 transition-all cursor-pointer shadow-soft">
                  <XCircle className="h-4 w-4" /> Rejected
                </div>
              </Link>
            </div>
          </div>

          {/* Functional Quick Note */}
          <div className="widget-card-hover relative group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Quick Note</h3>
              <span className="text-xs text-muted-foreground">
                {isSavingNote ? 'Saving...' : 'Autosaved'}
              </span>
            </div>

            <div className="border border-border rounded-widget p-4 min-h-[200px] flex flex-col gap-4 focus-within:ring-2 focus-within:ring-ring transition-shadow">
              {/* Toolbar (Visual Only for now) */}
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <button className="p-1.5 hover:bg-accent rounded text-muted-foreground font-medium text-xs">14px</button>
                <div className="w-px h-4 bg-border mx-1"></div>
                <button className="p-1.5 hover:bg-accent rounded text-muted-foreground"><Bold className="h-4 w-4" /></button>
                <button className="p-1.5 hover:bg-accent rounded text-muted-foreground"><Italic className="h-4 w-4" /></button>
                <button className="p-1.5 hover:bg-accent rounded text-muted-foreground"><Underline className="h-4 w-4" /></button>
              </div>

              <textarea
                value={note}
                onChange={handleNoteChange}
                className="w-full flex-1 resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                placeholder="Start writing your cover letter or interview notes here..."
              ></textarea>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveOverlay('generate')}
                  className="btn-gradient flex items-center gap-2 px-4 py-2 hover:scale-105 active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Generate
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Colonne Latérale (1/3) */}
        <div className="space-y-6">

          {/* Functional Time & Editable Reminder */}
          <div className="widget-card h-fit">
            <div className="text-4xl font-bold text-gradient mb-6 font-mono">
              {currentTime || "--:-- --"}
            </div>

            <div className="bg-orange-50 rounded-widget p-4 border border-orange-100 relative group">
              <div className="flex items-center justify-between gap-2 text-orange-500 font-bold text-xs uppercase tracking-wider mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Reminder
                </div>
                <button
                  onClick={handleCreateReminder}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-orange-100 rounded"
                >
                  <PenLine className="h-3 w-3" />
                </button>
              </div>

              {isEditingReminder ? (
                <div className="space-y-2">
                  <textarea
                    value={tempReminder}
                    onChange={(e) => setTempReminder(e.target.value)}
                    className="w-full p-2 text-sm border border-orange-200 rounded-input bg-orange-100/50 focus:outline-none focus:border-orange-300"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditingReminder(false)} className="text-xs text-orange-600 hover:underline">Cancel</button>
                    <button onClick={saveReminder} className="text-xs bg-orange-500 text-white px-2 py-1 rounded-button hover:bg-orange-600">Save</button>
                  </div>
                </div>
              ) : (
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {reminder}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions (SPA Triggers) */}
          <div className="widget-card">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveOverlay('analyze')}
                className="w-full py-3 rounded-button border border-border text-foreground font-medium hover:bg-accent hover:border-accent-foreground transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add New Application
              </button>

              <button
                onClick={() => setActiveOverlay('generate')}
                className="w-full py-3 rounded-button border border-border text-foreground font-medium hover:bg-accent hover:border-accent-foreground transition-all flex items-center justify-center gap-2 mt-3"
              >
                <FileText className="h-4 w-4" /> Manage CVs
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* OVERLAYS (Slide up effect) */}
      <div
        className={cn(
          "absolute inset-0 z-50 bg-white/50 backdrop-blur-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          activeOverlay === 'analyze' ? "translate-y-0" : "translate-y-full pointer-events-none opacity-0"
        )}
      >
        {activeOverlay === 'analyze' && (
          <AnalyzeOverlay
            onClose={() => setActiveOverlay('none')}
            onGenerateClick={() => setActiveOverlay('generate')}
          />
        )}
      </div>

      <div
        className={cn(
          "absolute inset-0 z-50 bg-white/50 backdrop-blur-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          activeOverlay === 'generate' ? "translate-y-0" : "translate-y-full pointer-events-none opacity-0"
        )}
      >
        {activeOverlay === 'generate' && (
          <GenerateOverlay
            onClose={() => setActiveOverlay('none')}
          />
        )}
      </div>

    </div>
  );
}
