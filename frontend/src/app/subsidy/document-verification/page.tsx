import React from 'react';
import { Metadata } from 'next';
import { DocumentVerificationView } from '@/components/verification/DocumentVerificationView';

export const metadata: Metadata = {
  title: 'Secure Document Verification & OCR | WhyEV Delhi Policy 2026',
  description: 'Learn what documents are required for EV subsidy verification, how your data is extracted securely via DigiLocker OCR, and how personal privacy is protected.',
};

export default function DocumentVerificationPage() {
  return <DocumentVerificationView />;
}
