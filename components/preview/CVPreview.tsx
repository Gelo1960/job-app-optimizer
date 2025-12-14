"use client";

import { CVContent } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

interface CVPreviewProps {
  content: CVContent;
}

export function CVPreview({ content }: CVPreviewProps) {
  const [isExporting, setIsExporting] = useState<"pdf" | "docx" | null>(null);

  const handleExport = async (format: "pdf" | "docx") => {
    setIsExporting(format);
    try {
      const filename = `CV_${content.header.name.replace(/\s+/g, '_')}.${format}`;
      const endpoint = format === "pdf" ? "/api/export/pdf" : "/api/export/docx";

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      if (!response.ok) throw new Error(`Failed to generate ${format.toUpperCase()}`);

      const blob = await response.blob();

      // Dynamic import to avoid SSR issues with file-saver if any
      const { saveAs } = await import("file-saver");
      saveAs(blob, filename);

    } catch (error) {
      console.error(`Error exporting ${format.toUpperCase()}:`, error);
      alert(`Erreur lors de l'export ${format.toUpperCase()}. Veuillez réessayer.`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <Card className="cv-preview bg-white">
      <CardHeader className="border-b">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1" />
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport("docx")}
              disabled={!!isExporting}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {isExporting === "docx" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Word (DOCX)
            </Button>
            <Button
              onClick={() => handleExport("pdf")}
              disabled={!!isExporting}
              variant="default"
              size="sm"
              className="gap-2"
            >
              {isExporting === "pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              PDF
            </Button>
          </div>
        </div>
        <div className="text-center space-y-2">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900">{content.header.name}</h1>
          <h2 className="text-xl text-blue-600 font-semibold">{content.header.title}</h2>
          <div className="text-sm text-gray-600 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {content.header.contact.map((item, i) => (
              <span key={i}>{item}</span>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Professional Summary */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-600">
            PROFIL PROFESSIONNEL
          </h3>
          <p className="text-gray-700 leading-relaxed">{content.professionalSummary}</p>
        </section>

        {/* Skills */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-600">
            COMPÉTENCES
          </h3>
          <div className="space-y-2">
            {content.skills.map((skillGroup, i) => (
              <div key={i} className="flex gap-2">
                <span className="font-semibold text-gray-900 min-w-[180px]">
                  {skillGroup.category}:
                </span>
                <span className="text-gray-700">{skillGroup.items.join(", ")}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-600">
            EXPÉRIENCE PROFESSIONNELLE
          </h3>
          <div className="space-y-4">
            {content.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{exp.title}</h4>
                    <p className="text-gray-700">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} className="text-gray-700 text-sm leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Projects (if any) */}
        {content.projects && content.projects.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-600">
              PROJETS
            </h3>
            <div className="space-y-4">
              {content.projects.map((project, i) => (
                <div key={i}>
                  <h4 className="font-bold text-gray-900 mb-1">{project.name}</h4>
                  <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Technologies:</span>{" "}
                    {project.tech.join(", ")}
                  </p>
                  <ul className="list-disc list-outside ml-5 space-y-1">
                    {project.highlights.map((highlight, j) => (
                      <li key={j} className="text-gray-700 text-sm">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-600">
            FORMATION
          </h3>
          <div className="space-y-2">
            {content.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{edu.degree}</p>
                  <p className="text-gray-700">{edu.institution}</p>
                </div>
                <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                  {edu.period}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Additional sections */}
        {content.additional && content.additional.length > 0 && (
          <>
            {content.additional.map((section, i) => (
              <section key={i}>
                <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-600">
                  {section.section.toUpperCase()}
                </h3>
                <p className="text-gray-700">{section.content}</p>
              </section>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
