'use client';

import React, { useState } from 'react';
import { VerificationHeroSection } from './VerificationHeroSection';
import { RequiredDocumentsGrid } from './RequiredDocumentsGrid';
import { ExtractedInfoComparison } from './ExtractedInfoComparison';
import { WhyWeNeedInfo } from './WhyWeNeedInfo';
import { PrivacySecuritySection } from './PrivacySecuritySection';
import { DocumentUploadSection } from './DocumentUploadSection';
import { ExtractionProgressModal } from './ExtractionProgressModal';
import { ReviewExtractedInfoSection } from './ReviewExtractedInfoSection';
import { ConsentSection } from './ConsentSection';

export function DocumentVerificationView() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(false);

  const handleStartExtraction = () => {
    setIsExtracting(true);
  };

  const handleExtractionComplete = () => {
    setIsExtracting(false);
    setHasExtracted(true);
  };

  const handleFinalSubmit = () => {
    alert('Documents verified successfully! Redirecting to your 30-Day Application Dashboard...');
    window.location.href = '/dashboard';
  };

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-12 text-slate-900 font-sans">
      {/* 1. Hero Section */}
      <VerificationHeroSection />

      {/* 2. Required Documents Grid */}
      <RequiredDocumentsGrid />

      {/* 3. Information We Extract vs Do Not Collect */}
      <ExtractedInfoComparison />

      {/* 4. Why We Need This Information */}
      <WhyWeNeedInfo />

      {/* 5. Privacy & Security Trust Section */}
      <PrivacySecuritySection />

      {/* 6. Upload Experience */}
      <DocumentUploadSection onStartExtraction={handleStartExtraction} />

      {/* 7. Information Extraction Progress Modal */}
      <ExtractionProgressModal isOpen={isExtracting} onComplete={handleExtractionComplete} />

      {/* 8. Review Extracted Information (Visible after extraction complete) */}
      {hasExtracted && <ReviewExtractedInfoSection onConfirm={handleFinalSubmit} />}

      {/* 9. Consent & Authorization */}
      <ConsentSection onFinalSubmit={handleFinalSubmit} />
    </div>
  );
}
