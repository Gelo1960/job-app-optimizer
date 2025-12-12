'use client';

// ============================================================================
// COMPONENT: CONTACT LIST
// Affiche les contacts trouvés avec Hunter.io
// ============================================================================

import React from 'react';
import { ContactSearchResult, Contact } from '@/lib/types';
import { Mail, Linkedin, User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactListProps {
  result: ContactSearchResult;
  selectedContact?: Contact;
  onSelectContact?: (contact: Contact) => void;
}

export function ContactList({
  result,
  selectedContact,
  onSelectContact,
}: ContactListProps) {
  const allContacts = [
    ...(result.hiringManager ? [{ ...result.hiringManager, role: 'Hiring Manager' }] : []),
    ...(result.teamLead ? [{ ...result.teamLead, role: 'Team Lead' }] : []),
    ...(result.hrContact ? [{ ...result.hrContact, role: 'HR Contact' }] : []),
    ...result.alternativeContacts.map(c => ({ ...c, role: 'Alternative Contact' })),
  ];

  if (allContacts.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">No contacts found</p>
        <p className="text-sm text-gray-400 mt-2">
          Try searching on LinkedIn or check the company website
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allContacts.map((contact, index) => (
        <ContactCard
          key={index}
          contact={contact}
          role={(contact as any).role}
          isSelected={selectedContact?.email === contact.email}
          onSelect={() => onSelectContact?.(contact)}
        />
      ))}
    </div>
  );
}

// ============================================================================
// CONTACT CARD
// ============================================================================

interface ContactCardProps {
  contact: Contact;
  role: string;
  isSelected: boolean;
  onSelect: () => void;
}

function ContactCard({ contact, role, isSelected, onSelect }: ContactCardProps) {
  const confidenceColor =
    contact.confidence >= 0.7
      ? 'text-green-600'
      : contact.confidence >= 0.4
      ? 'text-yellow-600'
      : 'text-gray-500';

  const confidenceLabel =
    contact.confidence >= 0.7
      ? 'High'
      : contact.confidence >= 0.4
      ? 'Medium'
      : 'Low';

  return (
    <div
      className={`
        relative rounded-lg border p-4 cursor-pointer transition-all
        ${
          isSelected
            ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        }
      `}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {contact.name}
            </h3>
            <span className={`text-xs font-medium ${confidenceColor}`}>
              {confidenceLabel}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-2">{contact.title}</p>

          <div className="flex items-center gap-1 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {role}
            </span>
          </div>

          {/* Contact methods */}
          <div className="flex items-center gap-3 mt-3">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span className="truncate max-w-[200px]">{contact.email}</span>
              </a>
            )}

            {contact.linkedinUrl && (
              <a
                href={contact.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Confidence</span>
          <span>{Math.round(contact.confidence * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${
              contact.confidence >= 0.7
                ? 'bg-green-500'
                : contact.confidence >= 0.4
                ? 'bg-yellow-500'
                : 'bg-gray-400'
            }`}
            style={{ width: `${contact.confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
