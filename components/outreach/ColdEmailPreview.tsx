'use client';

// ============================================================================
// COMPONENT: COLD EMAIL PREVIEW
// Preview des cold emails générés avec 3 variantes de ton
// ============================================================================

import React, { useState } from 'react';
import { ColdEmail, EmailTone } from '@/lib/types';
import { Copy, Check, Download, Mail, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ColdEmailPreviewProps {
  coldEmail: ColdEmail;
  onCopy?: (tone: EmailTone) => void;
  onExport?: (tone: EmailTone, format: 'html' | 'text') => void;
}

export function ColdEmailPreview({
  coldEmail,
  onCopy,
  onExport,
}: ColdEmailPreviewProps) {
  const [selectedTone, setSelectedTone] = useState<EmailTone>('friendly');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const variant = coldEmail.variants[selectedTone];

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    onCopy?.(selectedTone);
  };

  const handleCopyFull = async () => {
    const fullEmail = `Subject: ${variant.subject}\n\n${variant.bodyPlainText}`;
    await navigator.clipboard.writeText(fullEmail);
    setCopiedField('full');
    setTimeout(() => setCopiedField(null), 2000);
    onCopy?.(selectedTone);
  };

  return (
    <div className="space-y-4">
      {/* Header avec quality score */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cold Email Preview</h3>
          <p className="text-sm text-gray-500">
            Generated for {coldEmail.metadata.company}
          </p>
        </div>

        {/* Quality Score */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <Star className={`h-5 w-5 ${coldEmail.qualityScore >= 70 ? 'text-yellow-500' : 'text-gray-400'}`} />
          <div>
            <div className="text-xs text-gray-600">Quality Score</div>
            <div className="text-lg font-bold text-gray-900">{coldEmail.qualityScore}/100</div>
          </div>
        </div>
      </div>

      {/* Tone selector tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-2">
          {(['formal', 'friendly', 'direct'] as EmailTone[]).map((tone) => (
            <button
              key={tone}
              onClick={() => setSelectedTone(tone)}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize
                ${selectedTone === tone
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tone}
            </button>
          ))}
        </nav>
      </div>

      {/* Email preview */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        {/* Subject line */}
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1 font-medium">SUBJECT</div>
              <div className="text-sm font-medium text-gray-900">{variant.subject}</div>
            </div>
            <button
              onClick={() => handleCopy(variant.subject, 'subject')}
              className="flex-shrink-0 p-2 rounded-md hover:bg-gray-200 transition-colors"
              title="Copy subject"
            >
              {copiedField === 'subject' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Email body */}
        <div className="p-6">
          {/* HTML Preview */}
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: variant.bodyHtml }}
          />

          {/* Recipient info if available */}
          {coldEmail.recipientInfo && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">RECIPIENT</div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                  {coldEmail.recipientInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {coldEmail.recipientInfo.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {coldEmail.recipientInfo.title}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleCopyFull}
          className="flex-1"
          variant={copiedField === 'full' ? 'secondary' : 'default'}
        >
          {copiedField === 'full' ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Full Email
            </>
          )}
        </Button>

        <Button
          onClick={() => handleCopy(variant.bodyPlainText, 'body')}
          variant="outline"
        >
          {copiedField === 'body' ? (
            <Check className="h-4 w-4" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
        </Button>

        <Button
          onClick={() => onExport?.(selectedTone, 'html')}
          variant="outline"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Plain text preview (collapsible) */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
          <span>View Plain Text Version</span>
          <span className="text-xs text-gray-500 group-open:hidden">(click to expand)</span>
        </summary>
        <div className="mt-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
            {variant.bodyPlainText}
          </pre>
        </div>
      </details>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {variant.subject.split(' ').length}
          </div>
          <div className="text-xs text-gray-500">Words in subject</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {variant.bodyPlainText.split(' ').length}
          </div>
          <div className="text-xs text-gray-500">Words in body</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {variant.subject.length}
          </div>
          <div className="text-xs text-gray-500">Chars in subject</div>
        </div>
      </div>
    </div>
  );
}
