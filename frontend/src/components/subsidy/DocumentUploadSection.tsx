'use client';

import React, { useState } from 'react';
import { FileCheck } from 'lucide-react';
import { DocumentDropzoneCard, DocumentStatus, DocumentFileData } from './DocumentDropzoneCard';

interface DocItemState {
  status: DocumentStatus;
  progress: number;
  fileData: DocumentFileData | null;
  error: string | null;
}

export function DocumentUploadSection() {
  const [docStates, setDocStates] = useState<Record<string, DocItemState>>({
    rc: {
      status: 'uploaded',
      progress: 100,
      fileData: {
        name: 'Delhi_RC_Smartcard_NexonEV.pdf',
        size: '2.4 MB',
        isPdf: true,
      },
      error: null,
    },
    dl: {
      status: 'not_uploaded',
      progress: 0,
      fileData: null,
      error: null,
    },
    scrappage: {
      status: 'not_uploaded',
      progress: 0,
      fileData: null,
      error: null,
    },
  });

  const requiredDocs = ['rc', 'dl'];
  const uploadedRequiredCount = requiredDocs.filter((id) => docStates[id].status === 'uploaded' || docStates[id].status === 'verified').length;
  const progressPct = Math.round((uploadedRequiredCount / requiredDocs.length) * 100);

  const handleFileUpload = (docId: string, file: File) => {
    // 1. Size Validation (Max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setDocStates((prev) => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          error: `File "${file.name}" exceeds the 10MB size limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
        },
      }));
      return;
    }

    // 2. Format Validation (JPG, PNG, PDF)
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setDocStates((prev) => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          error: `Invalid file format for "${file.name}". Please upload a JPG, PNG, or PDF file.`,
        },
      }));
      return;
    }

    // Clear previous error and start simulated upload progress
    const isPdf = file.type === 'application/pdf';
    const previewUrl = isPdf ? undefined : URL.createObjectURL(file);
    const sizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    setDocStates((prev) => ({
      ...prev,
      [docId]: {
        status: 'uploading',
        progress: 10,
        fileData: { name: file.name, size: sizeFormatted, previewUrl, isPdf },
        error: null,
      },
    }));

    // Simulated Upload Progress Animation
    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += 30;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setDocStates((prev) => ({
          ...prev,
          [docId]: {
            status: 'uploaded',
            progress: 100,
            fileData: { name: file.name, size: sizeFormatted, previewUrl, isPdf },
            error: null,
          },
        }));
      } else {
        setDocStates((prev) => ({
          ...prev,
          [docId]: {
            ...prev[docId],
            progress: currentProgress,
          },
        }));
      }
    }, 250);
  };

  const handleReplace = (docId: string) => {
    setDocStates((prev) => ({
      ...prev,
      [docId]: {
        status: 'not_uploaded',
        progress: 0,
        fileData: null,
        error: null,
      },
    }));
  };

  const handleDelete = (docId: string) => {
    setDocStates((prev) => ({
      ...prev,
      [docId]: {
        status: 'not_uploaded',
        progress: 0,
        fileData: null,
        error: null,
      },
    }));
  };

  return (
    <div id="required-documents" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 space-y-8 shadow-sm">
      {/* Header & Aggregate Progress Bar */}
      <div className="space-y-4 border-b border-slate-100 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Claim Document Portal</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Required Claim Documents
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Upload mandatory documents to file your Delhi EV Policy 2026 subsidy claim within the 30-day window.
            </p>
          </div>

          {/* Aggregate Progress Indicator */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 shrink-0 sm:w-64">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Claim Progress</span>
              <span className="text-emerald-700">{uploadedRequiredCount} of {requiredDocs.length} Uploaded</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-medium text-right">
              {progressPct === 100 ? '✓ Ready to Submit Claim' : `${100 - progressPct}% remaining`}
            </div>
          </div>
        </div>
      </div>

      {/* Per-Document Dropzone Cards Grid */}
      <div className="space-y-6">
        {/* Document 1: Vehicle RC */}
        <DocumentDropzoneCard
          id="rc"
          label="Vehicle RC (Registration Certificate)"
          description="Upload official Delhi RC smart card or provisional RC issued by RTO."
          isRequired={true}
          status={docStates.rc.status}
          uploadProgress={docStates.rc.progress}
          fileData={docStates.rc.fileData}
          error={docStates.rc.error}
          onFileSelect={(file) => handleFileUpload('rc', file)}
          onReplace={() => handleReplace('rc')}
          onDelete={() => handleDelete('rc')}
        />

        {/* Document 2: Driving Licence */}
        <DocumentDropzoneCard
          id="dl"
          label="Driving Licence (Delhi Address Proof)"
          description="Valid Driving Licence proving NCT Delhi residency address."
          isRequired={true}
          status={docStates.dl.status}
          uploadProgress={docStates.dl.progress}
          fileData={docStates.dl.fileData}
          error={docStates.dl.error}
          onFileSelect={(file) => handleFileUpload('dl', file)}
          onReplace={() => handleReplace('dl')}
          onDelete={() => handleDelete('dl')}
        />

        {/* Document 3: Scrappage Certificate */}
        <DocumentDropzoneCard
          id="scrappage"
          label="Scrappage Certificate (Certificate of Deposit)"
          description="Upload scrap deposit certificate from RVSF for ₹25,000 scrappage bonus."
          isRequired={false}
          status={docStates.scrappage.status}
          uploadProgress={docStates.scrappage.progress}
          fileData={docStates.scrappage.fileData}
          error={docStates.scrappage.error}
          onFileSelect={(file) => handleFileUpload('scrappage', file)}
          onReplace={() => handleReplace('scrappage')}
          onDelete={() => handleDelete('scrappage')}
        />
      </div>
    </div>
  );
}
