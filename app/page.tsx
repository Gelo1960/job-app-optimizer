"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FileText,
  Briefcase,
  CheckCircle,
  Clock,
  MoreVertical,
  Search,
  Plus,
  Sparkles,
  TrendingUp,
  Calendar,
  X,
  Share2,
  Upload,
  Key,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  ChevronRight,
  Bot,
  Zap,
  Brain,
  ExternalLink,
  UserCircle
} from "lucide-react";

// Types
interface APIKey {
  id: string;
  provider: "openai" | "anthropic" | "deepseek";
  name: string;
  key: string;
  isVisible: boolean;
}

interface CV {
  id: string;
  name: string;
  uploadedAt: Date;
  size: string;
}

// Provider config
const AI_PROVIDERS = [
  {
    id: "anthropic",
    name: "Claude (Anthropic)",
    icon: Brain,
    color: "from-orange-400 to-amber-500",
    placeholder: "sk-ant-api03-...",
    docsUrl: "https://console.anthropic.com/settings/keys"
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: Zap,
    color: "from-green-400 to-emerald-500",
    placeholder: "sk-proj-...",
    docsUrl: "https://platform.openai.com/api-keys"
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: Bot,
    color: "from-blue-400 to-cyan-500",
    placeholder: "sk-...",
    docsUrl: "https://platform.deepseek.com/api_keys"
  },
];

export default function Home() {
  // State for API Keys
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKey, setNewKey] = useState({ provider: "anthropic" as const, key: "" });

  // State for CVs
  const [cvs, setCvs] = useState<CV[]>([
    { id: "1", name: "CV_Développeur_2024.pdf", uploadedAt: new Date(), size: "245 KB" }
  ]);
  const [showCVModal, setShowCVModal] = useState(false);

  // Handlers
  const addApiKey = () => {
    if (!newKey.key.trim()) return;
    const provider = AI_PROVIDERS.find(p => p.id === newKey.provider);
    setApiKeys([...apiKeys, {
      id: Date.now().toString(),
      provider: newKey.provider,
      name: provider?.name || newKey.provider,
      key: newKey.key,
      isVisible: false
    }]);
    setNewKey({ provider: "anthropic", key: "" });
    setShowKeyModal(false);
  };

  const toggleKeyVisibility = (id: string) => {
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, isVisible: !k.isVisible } : k));
  };

  const deleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  const deleteCV = (id: string) => {
    setCvs(cvs.filter(c => c.id !== id));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return "••••••••";
    return key.substring(0, 7) + "••••••••" + key.substring(key.length - 4);
  };

  return (
    <div className="min-h-screen p-8 pb-32 font-sans selection:bg-primary/20">

      {/* Header / Nav */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Job Optimizer
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium text-muted-foreground cursor-pointer hover:bg-white/80 transition-colors">
            <Search className="h-4 w-4" />
            <span>Search applications...</span>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="h-10 w-10 glass rounded-full flex items-center justify-center hover:bg-white transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column - Main Stats & Actions */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* Main "Happy Files" Style Card */}
          <section className="glass-card flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 cursor-pointer hover:opacity-100 transition-opacity">
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Gradient Icon Box */}
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/20 group-hover:scale-105 transition-transform duration-500">
              <Briefcase className="h-10 w-10 text-white" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="text-xs font-semibold tracking-wider text-purple-600 uppercase mb-1">Overview</div>
              <h2 className="text-3xl font-bold text-foreground">My Applications</h2>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-muted-foreground text-sm font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> 88 Applied
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> 24 Active
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> 9 Offers
                </div>
              </div>
            </div>
          </section>

          {/* CV Management Section */}
          <section className="glass-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">My CVs</h3>
                  <p className="text-xs text-muted-foreground">{cvs.length} document(s) uploaded</p>
                </div>
              </div>
              <button
                onClick={() => setShowCVModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-opacity"
              >
                <Upload className="h-4 w-4" /> Upload CV
              </button>
            </div>

            {/* CV List */}
            <div className="space-y-3 mt-4">
              {cvs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No CV uploaded yet</p>
                </div>
              ) : (
                cvs.map(cv => (
                  <div key={cv.id} className="flex items-center justify-between p-4 bg-white/40 rounded-xl border border-white/30 hover:bg-white/60 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cv.name}</p>
                        <p className="text-xs text-muted-foreground">{cv.size} • Uploaded today</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCV(cv.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* API Keys Section */}
          <section className="glass-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">API Keys</h3>
                  <p className="text-xs text-muted-foreground">Connect your AI providers</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/20 hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" /> Add Key
              </button>
            </div>

            {/* Provider Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {AI_PROVIDERS.map(provider => {
                const Icon = provider.icon;
                const hasKey = apiKeys.some(k => k.provider === provider.id);
                return (
                  <div
                    key={provider.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${hasKey
                      ? "bg-white/60 border-green-200 shadow-sm"
                      : "bg-white/30 border-white/20 hover:bg-white/50"
                      }`}
                    onClick={() => {
                      setNewKey({ ...newKey, provider: provider.id as any });
                      setShowKeyModal(true);
                    }}
                  >
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center mb-3`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-semibold text-sm">{provider.name}</p>
                    <p className={`text-xs mt-1 ${hasKey ? "text-green-600" : "text-muted-foreground"}`}>
                      {hasKey ? "✓ Connected" : "Not configured"}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Configured Keys List */}
            {apiKeys.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t border-white/20">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configured Keys</p>
                {apiKeys.map(apiKey => {
                  const provider = AI_PROVIDERS.find(p => p.id === apiKey.provider);
                  const Icon = provider?.icon || Key;
                  return (
                    <div key={apiKey.id} className="flex items-center justify-between p-3 bg-white/30 rounded-xl group">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${provider?.color || "from-gray-400 to-gray-500"} flex items-center justify-center`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{provider?.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {apiKey.isVisible ? apiKey.key : maskKey(apiKey.key)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                          {apiKey.isVisible ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </button>
                        <button
                          onClick={() => deleteKey(apiKey.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Status Badges */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold px-2">Application Status</h3>
            <div className="flex flex-wrap gap-3">
              <span className="glass px-4 py-2 rounded-2xl text-sm font-bold text-orange-500 flex items-center gap-2 shadow-sm border-orange-100 bg-orange-50/50">
                <Clock className="h-4 w-4" /> Pending
              </span>
              <span className="glass px-4 py-2 rounded-2xl text-sm font-bold text-blue-500 flex items-center gap-2 shadow-sm border-blue-100 bg-blue-50/50">
                <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> In progress
              </span>
              <span className="glass px-4 py-2 rounded-2xl text-sm font-bold text-purple-600 flex items-center gap-2 shadow-sm border-purple-100 bg-purple-50/50">
                <Share2 className="h-4 w-4" /> Submitted
              </span>
              <span className="glass px-4 py-2 rounded-2xl text-sm font-bold text-amber-500 flex items-center gap-2 shadow-sm border-amber-100 bg-amber-50/50">
                <Search className="h-4 w-4" /> In review
              </span>
              <span className="glass px-4 py-2 rounded-2xl text-sm font-bold text-green-500 flex items-center gap-2 shadow-sm border-green-100 bg-green-50/50">
                <CheckCircle className="h-4 w-4" /> Success
              </span>
              <span className="glass px-4 py-2 rounded-2xl text-sm font-bold text-red-400 flex items-center gap-2 shadow-sm border-red-100 bg-red-50/50 opacity-60">
                <X className="h-4 w-4" /> Failed
              </span>
            </div>
          </section>
        </div>

        {/* Right Column - Widgets */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Time Widget */}
          <section className="glass-card bg-gradient-to-b from-white/80 to-white/40 relative overflow-hidden !border-0 shadow-2xl shadow-orange-500/10">
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-orange-300 rounded-full blur-3xl opacity-20" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-purple-300 rounded-full blur-3xl opacity-20" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <h2 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-pink-500">
                  {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </h2>
              </div>

              <div className="glass p-4 rounded-2xl bg-white/60">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-2 uppercase tracking-wide">
                  <Calendar className="h-3 w-3" /> Today&apos;s Focus
                </div>
                <p className="text-sm font-medium text-gray-600 leading-relaxed">
                  Optimize your <span className="text-gray-900 font-bold">applications</span> with AI-powered insights!
                </p>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="glass-card flex flex-col gap-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <button className="w-full py-3 rounded-xl bg-white border border-gray-100 shadow-sm text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-transform active:scale-95">
              <Plus className="h-4 w-4" /> Add New Application
            </button>
            <button
              onClick={() => setShowCVModal(true)}
              className="w-full py-3 rounded-xl bg-white border border-gray-100 shadow-sm text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Upload className="h-4 w-4" /> Upload CV
            </button>
            <button
              onClick={() => setShowKeyModal(true)}
              className="w-full py-3 rounded-xl bg-white border border-gray-100 shadow-sm text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Key className="h-4 w-4" /> Configure API Keys
            </button>
            <Link
              href="/dashboard/profile"
              className="w-full py-3 rounded-xl bg-white border border-gray-100 shadow-sm text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <UserCircle className="h-4 w-4" /> Edit Profile
            </Link>
          </section>

          {/* AI Status */}
          <section className="glass-card">
            <h3 className="font-semibold mb-4">AI Status</h3>
            <div className="space-y-3">
              {AI_PROVIDERS.map(provider => {
                const Icon = provider.icon;
                const isConnected = apiKeys.some(k => k.provider === provider.id);
                return (
                  <div key={provider.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{provider.name.split(" ")[0]}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isConnected
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500"
                      }`}>
                      {isConnected ? "Ready" : "Offline"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

      </main>

      {/* Modal - Add API Key */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md !p-0 overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Add API Key</h2>
                <button onClick={() => setShowKeyModal(false)} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Connect your AI provider to enable smart features</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Provider Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {AI_PROVIDERS.map(provider => {
                    const Icon = provider.icon;
                    const isSelected = newKey.provider === provider.id;
                    return (
                      <button
                        key={provider.id}
                        onClick={() => setNewKey({ ...newKey, provider: provider.id as any })}
                        className={`p-3 rounded-xl border text-center transition-all ${isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-white/30 bg-white/30 hover:bg-white/50"
                          }`}
                      >
                        <div className={`h-8 w-8 mx-auto rounded-lg bg-gradient-to-br ${provider.color} flex items-center justify-center mb-2`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-xs font-medium">{provider.name.split(" ")[0]}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">API Key</label>
                  <a
                    href={AI_PROVIDERS.find(p => p.id === newKey.provider)?.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Get key <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={newKey.key}
                  onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                  placeholder={AI_PROVIDERS.find(p => p.id === newKey.provider)?.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-mono"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Your key is stored locally and never sent to our servers.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-white/20 flex gap-3">
              <button
                onClick={() => setShowKeyModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/50 border border-white/30 text-sm font-medium hover:bg-white/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addApiKey}
                disabled={!newKey.key.trim()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Upload CV */}
      {showCVModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md !p-0 overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Upload CV</h2>
                <button onClick={() => setShowCVModal(false)} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Add your resume to optimize applications</p>
            </div>

            <div className="p-6">
              {/* Drop Zone */}
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  id="cv-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCvs([...cvs, {
                        id: Date.now().toString(),
                        name: file.name,
                        uploadedAt: new Date(),
                        size: `${Math.round(file.size / 1024)} KB`
                      }]);
                      setShowCVModal(false);
                    }
                  }}
                />
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-semibold mb-1">Click to upload</p>
                  <p className="text-sm text-muted-foreground">or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-2">PDF, DOC, DOCX (max 10MB)</p>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-white/20">
              <button
                onClick={() => setShowCVModal(false)}
                className="w-full py-3 rounded-xl bg-white/50 border border-white/30 text-sm font-medium hover:bg-white/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
