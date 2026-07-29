import React from 'react';
import { Metadata } from 'next';
import { DocumentVerificationView } from '@/components/verification/DocumentVerificationView';

export const metadata: Metadata = {
  title: 'RC Upload & Vision AI OCR Pre-fill | WhyEV Delhi Policy 2026',
  description: 'Upload your RC smartcard or invoice via drag-and-drop or camera capture. Vision AI extracts specs for your confirmation with instant manual fallback.',
};

export default function DocumentVerificationPage() {
  return <DocumentVerificationView />;
}
