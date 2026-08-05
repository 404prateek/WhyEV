'use client';

import React from 'react';

interface CleanAiAgentIconProps {
  className?: string;
  size?: number;
}

export function CleanAiAgentIcon({ className = '', size = 24 }: CleanAiAgentIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Primary Clean AI Spark */}
      <path
        d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Accent Spark */}
      <path
        d="M18.5 2.5L19.5 5.5L22.5 6.5L19.5 7.5L18.5 10.5L17.5 7.5L14.5 6.5L17.5 5.5L18.5 2.5Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}
