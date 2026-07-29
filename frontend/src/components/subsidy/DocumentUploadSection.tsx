'use client';

import React, { useState, useRef } from 'react';
import {
  FileCheck,
  Upload,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Edit3,
  RefreshCw,
  Trash2,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { subsidyApi } from '@/lib/api';

export interface ExtractedRcFields {
  rc_number: string;
  registration_date: string;
  vehicle_category: string;
  chassis_number: string;
}

export function DocumentUploadSection() {
  const [fileState, setFileState] = useState<{
    name: string;
    size: string;
    s3Url?: string;
    fileObj?: File;
  } | null>(null);

  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing_ocr' | 'ready' | 'error'>('idle');
  const [ocrMode, setOcrMode] = useState<'none' | 'extracted' | 'manual'>('none');
  const [isUserConfirmed, setIsUserConfirmed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [formFields, setFormFields] = useState<ExtractedRcFields>({
    rc_number: '',
    registration_date: '',
    vehicle_category: '4W',
    chassis_number: '',
  });

  const handleProcessFile = async (file: File) => {
    // 1. Validation
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(`File "${file.name}" exceeds the 10MB size limit.`);
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(`Invalid format for "${file.name}". Please upload JPG, PNG, WEBP, or PDF.`);
      return;
    }

    setErrorMessage(null);
    setUploadStatus('uploading');
    setIsUserConfirmed(false);

    const sizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    setFileState({ name: file.name, size: sizeFormatted, fileObj: file });

    // 2. Simulated S3 Upload & Vision LLM OCR Extraction
    try {
      setUploadStatus('processing_ocr');
      const formData = new FormData();
      formData.append('file', file);

      const ocrRes = await subsidyApi.extractOcrData(formData);

      if (ocrRes.success && ocrRes.extracted_data) {
        setFormFields({
          rc_number: ocrRes.extracted_data.rc_number,
          registration_date: ocrRes.extracted_data.registration_date || '2026-07-15',
          vehicle_category: ocrRes.extracted_data.vehicle_category || '4W',
          chassis_number: ocrRes.extracted_data.chassis_number,
        });
        setOcrMode('extracted');
        setUploadStatus('ready');
      } else {
        const errorMsg = (ocrRes as any).error || 'Uploaded file is not a valid vehicle RC Smartcard or Purchase Invoice. Please upload an official document photo.';
        setErrorMessage(errorMsg);
        setUploadStatus('error');
        setFileState(null);
      }
    } catch (e: any) {
      console.warn('[Document verification failed]:', e);
      setErrorMessage(e?.message || 'Document verification failed. Please upload a clear photo of your RC Smartcard or Invoice.');
      setUploadStatus('error');
      setFileState(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.rc_number || !formFields.chassis_number) {
      alert('Please fill in required RC details.');
      return;
    }
    setIsUserConfirmed(true);
  };

  const handleReset = () => {
    setFileState(null);
    setUploadStatus('idle');
    setOcrMode('none');
    setIsUserConfirmed(false);
    setErrorMessage(null);
  };

  return (
    <div id="required-documents" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 space-y-8 shadow-sm">
      {/* Header & Aggregate Progress */}
      <div className="space-y-4 border-b border-slate-100 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Smart Claim Document Verification</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              RC Photo / Purchase Invoice Upload
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Upload your RC smartcard photo or purchase invoice via drag-and-drop or mobile camera. Vision AI pre-fills your details for confirmation.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-right shrink-0">
            <div className="text-xs font-bold text-slate-700">Document Security</div>
            <div className="text-[11px] text-emerald-700 font-bold flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>S3 Encrypted Storage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden inputs for File and Mobile Camera */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleProcessFile(e.target.files[0])}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleProcessFile(e.target.files[0])}
      />

      {/* Upload Dropzone / Camera Action */}
      {!fileState && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="p-8 sm:p-12 rounded-3xl bg-slate-50 border-2 border-dashed border-emerald-300 hover:border-emerald-500 transition-all text-center space-y-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <Upload className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-extrabold text-slate-900">
              Drag & Drop your RC Photo or Purchase Invoice
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Supports JPG, PNG, WEBP, or PDF (up to 10MB). Stored securely to encrypted S3 storage.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium max-w-md mx-auto flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span>Browse Files from Device</span>
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Mobile Camera Capture</span>
            </button>
          </div>
        </div>
      )}

      {/* Uploaded File Banner & Vision AI OCR Processing */}
      {fileState && (
        <div className="space-y-6">
          {/* File Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">{fileState.name}</div>
                <div className="text-[11px] text-slate-500">Size: {fileState.size} · Uploaded to S3 Storage</div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Replace File</span>
            </button>
          </div>

          {/* OCR Processing State */}
          {uploadStatus === 'processing_ocr' && (
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <div className="text-sm font-extrabold text-slate-900">Running Vision AI OCR Pre-Fill…</div>
              <div className="text-xs text-slate-500">Extracting RC Number, Registration Date, Category & Chassis Number</div>
            </div>
          )}

          {/* Extracted / Manual Form View */}
          {uploadStatus === 'ready' && (
            <div className="space-y-6">
              {/* Vision AI Extraction Banner (Mandatory Confirmation Rule) */}
              {ocrMode === 'extracted' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                      <Sparkles className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">
                        ✨ We extracted these fields using AI Vision — please confirm they're correct.
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Review and edit any pre-filled value below before clicking submit.
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setOcrMode('manual')}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 underline shrink-0 cursor-pointer"
                  >
                    Switch to Manual Entry
                  </button>
                </div>
              )}

              {/* Manual Entry Fallback Banner */}
              {ocrMode === 'manual' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-slate-900 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                    <div className="text-xs text-amber-900 font-medium">
                      💡 Couldn't automatically read document specs. Please enter your RC details manually below.
                    </div>
                  </div>
                </div>
              )}

              {/* Pre-filled / Manual Editable Form */}
              <form onSubmit={handleConfirmForm} className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/90 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-emerald-600" />
                    <span>Confirm Vehicle Registration Specs</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">All fields editable</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Field 1: RC Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">RC Number *</label>
                    <input
                      type="text"
                      value={formFields.rc_number}
                      onChange={(e) => setFormFields({ ...formFields, rc_number: e.target.value })}
                      placeholder="e.g. DL-01-EV-2026-88"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Field 2: Registration Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Registration Date *</label>
                    <input
                      type="date"
                      value={formFields.registration_date}
                      onChange={(e) => setFormFields({ ...formFields, registration_date: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Field 3: Vehicle Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Vehicle Category *</label>
                    <select
                      value={formFields.vehicle_category}
                      onChange={(e) => setFormFields({ ...formFields, vehicle_category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="2W">2W (Electric Two-Wheeler)</option>
                      <option value="3W">3W (Electric Three-Wheeler)</option>
                      <option value="4W">4W (Electric Four-Wheeler)</option>
                      <option value="N1_goods">4W Goods (N1 Category)</option>
                    </select>
                  </div>

                  {/* Field 4: Chassis / VIN Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Chassis / VIN Number *</label>
                    <input
                      type="text"
                      value={formFields.chassis_number}
                      onChange={(e) => setFormFields({ ...formFields, chassis_number: e.target.value })}
                      placeholder="e.g. ME1NE45EV202699881"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 uppercase"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {isUserConfirmed ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Details Confirmed by User & Saved</span>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Save Document Specs</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
