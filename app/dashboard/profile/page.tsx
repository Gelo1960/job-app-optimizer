"use client"

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Briefcase,
  GraduationCap,
  Code2,
  Plus,
  Save,
  Trash2,
  Sparkles
} from "lucide-react";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-8 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and professional identity
          </p>
        </div>
        <button className="glass px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/25 hover:opacity-90 transition-all flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Col - Personal Details */}
        <div className="lg:col-span-1 space-y-6">
          <section className="glass-card space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">Identity</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground ml-1">Full Name</label>
                <div className="mt-1.5 relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="text" defaultValue="Ange Yaokouassi" className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                <div className="mt-1.5 relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="email" defaultValue="ange@example.com" className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground ml-1">Phone</label>
                <div className="mt-1.5 relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="tel" placeholder="+33 6 12 34 56 78" className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground ml-1">Location</label>
                <div className="mt-1.5 relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Paris, France" className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <Globe className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">Socials</h2>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <Linkedin className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                <input type="text" placeholder="LinkedIn URL" className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>

              <div className="relative group">
                <Github className="absolute left-3 top-3 h-4 w-4 text-gray-800" />
                <input type="text" placeholder="GitHub URL" className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>

              <div className="relative group">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                <input type="text" placeholder="Portfolio URL" className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
            </div>
          </section>
        </div>

        {/* Right Col - Professional Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Work Experience */}
          <section className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Experience</h2>
              </div>
              <button className="p-2 hover:bg-white/50 rounded-lg transition-colors text-primary">
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center py-10 border-2 border-dashed border-gray-300/50 rounded-2xl bg-white/20">
              <Briefcase className="h-10 w-10 mx-auto text-gray-400 mb-3 opacity-50" />
              <h3 className="text-sm font-medium text-gray-600">No experience added</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Add your internships and jobs</p>
              <button className="text-xs font-semibold px-4 py-2 rounded-lg bg-white/50 hover:bg-white transition-colors border border-gray-200">
                Add Experience
              </button>
            </div>
          </section>

          {/* Education */}
          <section className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Education</h2>
              </div>
              <button className="p-2 hover:bg-white/50 rounded-lg transition-colors text-primary">
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center py-10 border-2 border-dashed border-gray-300/50 rounded-2xl bg-white/20">
              <GraduationCap className="h-10 w-10 mx-auto text-gray-400 mb-3 opacity-50" />
              <h3 className="text-sm font-medium text-gray-600">No education added</h3>
            </div>
          </section>

          {/* Skills */}
          <section className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                  <Code2 className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Skills</h2>
              </div>
              <button className="glass px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-white transition-colors">
                <Sparkles className="h-3 w-3 text-purple-500" />
                Auto-detect from CV
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "Figma", "UI/UX Design"].map((skill) => (
                <span key={skill} className="px-3 py-1.5 rounded-xl bg-white/40 border border-white/20 text-sm font-medium text-gray-700 hover:bg-white/60 transition-colors cursor-default flex items-center gap-2 group">
                  {skill}
                  <button className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button className="px-3 py-1.5 rounded-xl border-2 border-dashed border-gray-300/60 text-sm font-medium text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center gap-1">
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
