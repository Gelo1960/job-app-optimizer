'use client';

// ============================================================================
// PAGE: OUTREACH
// Workflow complet de cold email generation
// ============================================================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  JobAnalysis,
  CompanyEnrichment,
  ContactSearchResult,
  Contact,
  ColdEmail,
  EmailTone,
} from '@/lib/types';
import { ContactList } from '@/components/outreach/ContactList';
import { ToneSelector } from '@/components/outreach/ToneSelector';
import { ColdEmailPreview } from '@/components/outreach/ColdEmailPreview';
import { Loader2, Search, Mail, Sparkles, AlertCircle } from 'lucide-react';

export default function OutreachPage() {
  // Step 1: Job posting input
  const [jobText, setJobText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');

  // Step 2: Analysis results
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  const [companyEnrichment, setCompanyEnrichment] = useState<CompanyEnrichment | null>(null);

  // Step 3: Contact search
  const [contactResults, setContactResults] = useState<ContactSearchResult | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);

  // Step 4: Email generation
  const [selectedTone, setSelectedTone] = useState<EmailTone>('friendly');
  const [generatedEmail, setGeneratedEmail] = useState<ColdEmail | null>(null);

  // UI state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // STEP 1: ANALYZE JOB
  // ============================================================================

  async function handleAnalyzeJob() {
    if (!jobText || jobText.length < 100) {
      setError('Please provide at least 100 characters of job description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Analyze job
      const jobRes = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobText }),
      });

      const jobData = await jobRes.json();
      if (!jobData.success) throw new Error(jobData.error);

      setJobAnalysis(jobData.data);

      // Enrich company if name provided
      if (companyName) {
        const companyRes = await fetch('/api/enrich-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName }),
        });

        const companyData = await companyRes.json();
        if (companyData.success) {
          setCompanyEnrichment(companyData.data);
        }
      }

      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // STEP 2: FIND CONTACTS
  // ============================================================================

  async function handleFindContacts() {
    if (!companyName) {
      setError('Company name is required to find contacts');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/find-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          domain: companyDomain || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setContactResults(data.data);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Contact search failed');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // STEP 3: GENERATE EMAIL
  // ============================================================================

  async function handleGenerateEmail() {
    if (!jobAnalysis || !companyEnrichment) {
      setError('Please complete job analysis first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For demo, using a mock user profile ID
      // In production, get from auth context
      const userProfileId = 'demo-user-123';

      const res = await fetch('/api/generate-cold-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfileId,
          jobAnalysis,
          companyEnrichment,
          contactInfo: selectedContact,
          tones: ['formal', 'friendly', 'direct'],
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setGeneratedEmail(data.data);
      setCurrentStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email generation failed');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cold Email Outreach</h1>
        <p className="text-gray-600">
          Generate personalized cold emails to land your dream job
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { step: 1, label: 'Job Info' },
          { step: 2, label: 'Find Contacts' },
          { step: 3, label: 'Choose Tone' },
          { step: 4, label: 'Generate Email' },
        ].map(({ step, label }) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`
                flex items-center justify-center h-8 w-8 rounded-full border-2 font-semibold text-sm
                ${
                  currentStep >= step
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }
              `}
            >
              {step}
            </div>
            <div className="flex-1 ml-2">
              <div
                className={`text-xs font-medium ${
                  currentStep >= step ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {label}
              </div>
            </div>
            {step < 4 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* STEP 1: Job Input */}
      {currentStep === 1 && (
        <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Step 1: Job Information
            </CardTitle>
            <CardDescription>
              Paste the job description and company details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <Textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the full job description here..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Airbnb"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Domain (optional)
                </label>
                <Input
                  value={companyDomain}
                  onChange={(e) => setCompanyDomain(e.target.value)}
                  placeholder="e.g., airbnb.com"
                />
              </div>
            </div>

            <Button
              onClick={handleAnalyzeJob}
              disabled={loading || !jobText || !companyName}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Job & Company
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Find Contacts */}
      {currentStep === 2 && (
        <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-purple-600" />
              Step 2: Find Contacts
            </CardTitle>
            <CardDescription>
              Search for recruiters and hiring managers at {companyName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Job Analysis Summary */}
            {jobAnalysis && (
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Job Analysis</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Seniority:</span>{' '}
                    <span className="font-medium capitalize">{jobAnalysis.seniorityLevel}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Company Type:</span>{' '}
                    <span className="font-medium capitalize">{jobAnalysis.companyType}</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleFindContacts}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching contacts...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Contacts
                </>
              )}
            </Button>

            <Button
              onClick={() => {
                setCurrentStep(3);
              }}
              variant="outline"
              className="w-full"
            >
              Skip (I&apos;ll add contact manually)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Choose Contact & Tone */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Contacts */}
          {contactResults && (
            <Card>
              <CardHeader>
                <CardTitle>Contacts Found</CardTitle>
                <CardDescription>
                  Select a contact to personalize your email (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactList
                  result={contactResults}
                  selectedContact={selectedContact}
                  onSelectContact={setSelectedContact}
                />
              </CardContent>
            </Card>
          )}

          {/* Tone Selector */}
          <Card className="border-2 border-green-500/20 bg-gradient-to-br from-white to-green-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                Step 3: Choose Email Tone
              </CardTitle>
              <CardDescription>
                Select the communication style that fits the company culture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToneSelector selectedTone={selectedTone} onSelectTone={setSelectedTone} />

              <Button
                onClick={handleGenerateEmail}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating email...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Cold Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 4: Email Preview */}
      {currentStep === 4 && generatedEmail && (
        <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Your Cold Email
            </CardTitle>
            <CardDescription>
              Review and copy your personalized cold email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ColdEmailPreview
              coldEmail={generatedEmail}
              onCopy={(tone) => console.log('Copied', tone)}
              onExport={(tone, format) => console.log('Export', tone, format)}
            />

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => {
                  setCurrentStep(1);
                  setGeneratedEmail(null);
                  setContactResults(null);
                  setJobAnalysis(null);
                  setCompanyEnrichment(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Start New Email
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
