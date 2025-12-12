'use client';

// ============================================================================
// COMPONENT: TONE SELECTOR
// Sélecteur de ton pour les cold emails
// ============================================================================

import React from 'react';
import { EmailTone } from '@/lib/types';
import { Building2, Smile, Zap } from 'lucide-react';

interface ToneSelectorProps {
  selectedTone: EmailTone;
  onSelectTone: (tone: EmailTone) => void;
  disabled?: boolean;
}

const TONE_CONFIG: Record<EmailTone, {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  example: string;
}> = {
  formal: {
    label: 'Formal',
    description: 'Professional and respectful',
    icon: Building2,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    example: 'Dear [Name], I recently came across...',
  },
  friendly: {
    label: 'Friendly',
    description: 'Warm and conversational',
    icon: Smile,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    example: 'Hi [Name], I\'ve been following your work...',
  },
  direct: {
    label: 'Direct',
    description: 'Concise and action-oriented',
    icon: Zap,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    example: '[Name], Saw your work on [project]...',
  },
};

export function ToneSelector({
  selectedTone,
  onSelectTone,
  disabled = false,
}: ToneSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Email Tone</h3>
        <p className="text-xs text-gray-500">Choose your communication style</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(Object.keys(TONE_CONFIG) as EmailTone[]).map((tone) => {
          const config = TONE_CONFIG[tone];
          const Icon = config.icon;
          const isSelected = selectedTone === tone;

          return (
            <button
              key={tone}
              onClick={() => !disabled && onSelectTone(tone)}
              disabled={disabled}
              className={`
                relative p-4 rounded-lg border-2 text-left transition-all
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                ${isSelected
                  ? `${config.borderColor} ${config.bgColor} ring-2 ring-offset-2 ring-${tone === 'formal' ? 'blue' : tone === 'friendly' ? 'green' : 'purple'}-500/20`
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className={`h-3 w-3 rounded-full ${tone === 'formal' ? 'bg-blue-500' : tone === 'friendly' ? 'bg-green-500' : 'bg-purple-500'}`} />
                </div>
              )}

              {/* Icon */}
              <div className={`mb-3 ${isSelected ? config.color : 'text-gray-400'}`}>
                <Icon className="h-6 w-6" />
              </div>

              {/* Label */}
              <h4 className={`font-semibold mb-1 ${isSelected ? config.color : 'text-gray-900'}`}>
                {config.label}
              </h4>

              {/* Description */}
              <p className="text-xs text-gray-600 mb-3">
                {config.description}
              </p>

              {/* Example */}
              <div className={`text-xs italic ${isSelected ? 'text-gray-700' : 'text-gray-500'} border-l-2 pl-2 ${isSelected ? config.borderColor : 'border-gray-300'}`}>
                {config.example}
              </div>
            </button>
          );
        })}
      </div>

      {/* Recommendation based on context */}
      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">Tip:</span> Use{' '}
          <span className="font-medium text-blue-700">Formal</span> for corporate environments,{' '}
          <span className="font-medium text-green-700">Friendly</span> for startups/tech,{' '}
          <span className="font-medium text-purple-700">Direct</span> for busy executives.
        </p>
      </div>
    </div>
  );
}
