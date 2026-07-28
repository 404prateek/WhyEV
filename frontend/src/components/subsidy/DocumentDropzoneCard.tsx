'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Trash2,
  ShieldCheck,
  File,
} from 'lucide-react';

export interface DocumentFileData {
  name: string;
  size: string;
  previewUrl?: string;
  isPdf?: boolean;
}

export type DocumentStatus = 'not_uploaded' | 'uploading' | 'uploaded' | 'verified';

interface DocumentDropzoneCardProps {
  id: string;
  label: string;
  description: string;
  isRequired: boolean;
  status: DocumentStatus;
  uploadProgress?: number;
  fileData?: DocumentFileData | null;
  error?: string | null;
  onFileSelect: (file: File) => void;
  onReplace: () => void;
  onDelete: () => void;
}

export function DocumentDropzoneCard({
  id,
  label,
  description,
  isRequired,
  status,
  uploadProgress = 0,
  fileData,
  error,
  onFileSelect,
  onReplace,
  onDelete,
}: DocumentDropzoneCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
      {/* Header Label & Per-Document Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-extrabold text-slate-900">{label}</h4>
            {isRequired ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                Required
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                Optional
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-normal">{description}</p>
        </div>

        {/* Status Badge */}
        <div>
          {status === 'not_uploaded' && (
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
              Not Uploaded
            </span>
          )}
          {status === 'uploading' && (
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
              Uploading ({uploadProgress}%)
            </span>
          )}
          {status === 'uploaded' && (
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Uploaded
            </span>
          )}
          {status === 'verified' && (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Verified by Transport Dept
            </span>
          )}
        </div>
      </div>

      {/* Inline Error Message */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Card Content States */}
      {status === 'not_uploaded' && (
        /* Dropzone State (Keyboard accessible + Drag & Drop) */
        <div
          tabIndex={0}
          role="button"
          aria-label={`Upload ${label}`}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 outline-none ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-50/70 ring-4 ring-emerald-500/10'
              : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 bg-slate-50/50'
          }`}
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                Click to upload <span className="font-normal text-slate-500">or drag and drop</span>
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">
                Accepted formats: JPG, PNG, or PDF (Max 10MB)
              </div>
            </div>
          </div>
        </div>
      )}

      {status === 'uploading' && (
        /* Uploading State with Progress Bar */
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Uploading Document...</span>
            <span className="text-emerald-700">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {(status === 'uploaded' || status === 'verified') && fileData && (
        /* Uploaded / Preview State */
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Thumbnail or File Icon */}
            {fileData.previewUrl && !fileData.isPdf ? (
              <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                <Image src={fileData.previewUrl} alt={fileData.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-emerald-700" />
              </div>
            )}

            <div className="space-y-0.5 min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">{fileData.name}</div>
              <div className="text-xs text-slate-500 font-medium">{fileData.size} · Uploaded</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => {
                onReplace();
                fileInputRef.current?.click();
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Replace</span>
            </button>

            <button
              onClick={onDelete}
              className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
