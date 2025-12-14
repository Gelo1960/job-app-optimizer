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
          <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm border border-purple-100/50">
            <div className="absolute top-0 right-0 p-4">
              <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <MoreVertical className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="flex items-start gap-6">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white shrink-0">
                <Briefcase className="h-10 w-10" />
              </div>

              <div className="flex-1 pt-2">
                <div className="text-xs font-bold text-purple-600 tracking-wider uppercase mb-1">OVERVIEW</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">My Applications</h1>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 group cursor-help" title="Total Applications Sent">
                    <div className="p-1.5 rounded-md bg-gray-100 group-hover:bg-gray-200 transition-colors">
                      <FileText className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-semibold text-gray-900">{loading ? '-' : stats?.totalApplications || 0}</span>
                    <span className="text-gray-500">Applied</span>
                  </div>

                  <div className="flex items-center gap-2 group cursor-help" title="Active (Not Rejected)">
                    <div className="p-1.5 rounded-md bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="font-semibold text-gray-900">{loading ? '-' : activeApplications}</span>
                    <span className="text-gray-500">Active</span>
                  </div>

                  <div className="flex items-center gap-2 group cursor-help" title="Positive Responses">
                    <div className="p-1.5 rounded-md bg-green-50 group-hover:bg-green-100 transition-colors">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-semibold text-gray-900">{loading ? '-' : stats?.positiveResponses || 0}</span>
                    <span className="text-gray-500">Offers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Functional Status Pills (Filters) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Status Example</h3>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard/applications?status=pending">
                <div className="px-4 py-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-2 text-sm font-medium hover:bg-orange-100 transition-colors cursor-pointer">
                  <Clock className="h-4 w-4" /> Pending
                </div>
              </Link>
              <Link href="/dashboard/applications?status=sent">
                <div className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-2 text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer">
                  <Loader2 className="h-4 w-4" /> Sent
                </div>
              </Link>
              <Link href="/dashboard/applications?status=response_positive">
                <div className="px-4 py-2 rounded-xl bg-green-50 text-green-600 border border-green-100 flex items-center gap-2 text-sm font-medium hover:bg-green-100 transition-colors cursor-pointer">
                  <CheckCircle2 className="h-4 w-4" /> Positive
                </div>
              </Link>
              <Link href="/dashboard/applications?status=response_negative">
                <div className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center gap-2 text-sm font-medium hover:bg-red-100 transition-colors cursor-pointer">
                  <XCircle className="h-4 w-4" /> Rejected
                </div>
              </Link>
            </div>
          </div>

          {/* Functional Quick Note */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Quick Note</h3>
              <span className="text-xs text-gray-400">
                {isSavingNote ? 'Saving...' : 'Autosaved'}
              </span>
            </div>

            <div className="border border-gray-200 rounded-2xl p-4 min-h-[200px] flex flex-col gap-4 focus-within:ring-2 focus-within:ring-purple-100 transition-shadow">
              {/* Toolbar (Visual Only for now) */}
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 font-medium text-xs">14px</button>
                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Bold className="h-4 w-4" /></button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Italic className="h-4 w-4" /></button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Underline className="h-4 w-4" /></button>
              </div>

              <textarea
                value={note}
                onChange={handleNoteChange}
                className="w-full flex-1 resize-none outline-none text-sm text-gray-600 placeholder:text-gray-300"
                placeholder="Start writing your cover letter or interview notes here..."
              ></textarea>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveOverlay('generate')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium text-sm shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105 active:scale-95"
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
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
            <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 mb-6 font-mono">
              {currentTime || "--:-- --"}
            </div>

            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 relative group">
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
                    className="w-full p-2 text-sm border border-orange-200 rounded-lg bg-orange-100/50 focus:outline-none focus:border-orange-300"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditingReminder(false)} className="text-xs text-orange-600 hover:underline">Cancel</button>
                    <button onClick={saveReminder} className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600">Save</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {reminder}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions (SPA Triggers) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveOverlay('analyze')}
                className="w-full py-3 rounded-2xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add New Application
              </button>

              <button
                onClick={() => setActiveOverlay('generate')}
                className="w-full py-3 rounded-2xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 mt-3"
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
