'use client';

import React from 'react';

interface WhyEvVectorLogoProps {
  className?: string;
  size?: number;
}

export function WhyEvVectorLogo({ className = 'w-9 h-9', size = 36 }: WhyEvVectorLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Green Gradient for Outer Speech Ring & Energy Rays */}
        <linearGradient id="whyevLogoGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="35%" stopColor="#047857" />
          <stop offset="70%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#84cc16" />
        </linearGradient>

        {/* Car Body Dark Green Slate Gradient */}
        <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#062920" />
          <stop offset="100%" stopColor="#031913" />
        </linearGradient>

        {/* Bolt Bright Lime Gradient */}
        <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>

      {/* Top-Right Energy Burst Rays */}
      <line x1="78" y1="20" x2="84" y2="12" stroke="url(#whyevLogoGrad)" strokeWidth="4" strokeLinecap="round" />
      <line x1="86" y1="29" x2="94" y2="23" stroke="url(#whyevLogoGrad)" strokeWidth="4" strokeLinecap="round" />
      <line x1="88" y1="41" x2="96" y2="39" stroke="url(#whyevLogoGrad)" strokeWidth="4" strokeLinecap="round" />

      {/* Outer Circular Speech Bubble with Tail */}
      <path
        d="M 50 8
           C 72 8 88 23 88 45
           C 88 61 77 75 62 81
           C 53 87 46 93 42 95
           C 41 95.5 39.5 94 40.5 89.5
           C 41.5 85 40 82.5 37.5 81.5
           C 20 78.5 10 63 10 45
           C 10 23 28 8 50 8 Z"
        stroke="url(#whyevLogoGrad)"
        strokeWidth="6"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Bottom-Right Eco Leaf Accent */}
      <path
        d="M 46 83 C 60 83 73 74 77 61 C 65 63 51 72 46 83 Z"
        fill="url(#whyevLogoGrad)"
      />
      <path
        d="M 53 79 Q 63 72 72 65"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Front View EV Car Silhouette */}
      <g>
        {/* Outer Shadow/Body */}
        <path
          d="M 33 38 C 36 29 42 27 50 27 C 58 27 64 29 67 38 L 72 48 C 74.5 48 76.5 50 76.5 53 L 76.5 68 C 76.5 71 74.5 73 71.5 73 L 69 73 C 67 73 66 70 66 68 L 66 66 L 34 66 L 34 68 C 34 70 33 73 31 73 L 28.5 73 C 25.5 73 23.5 71 23.5 68 L 23.5 53 C 23.5 50 25.5 48 28 48 Z"
          fill="url(#carBodyGrad)"
        />

        {/* Front Windshield Cutout */}
        <path
          d="M 36 39.5 C 38.5 32.5 43.5 30.5 50 30.5 C 56.5 30.5 61.5 32.5 64 39.5 Z"
          fill="#ffffff"
          opacity="0.95"
        />

        {/* Sleek Left & Right Headlights */}
        <path d="M 27.5 53 Q 33.5 52 35.5 56.5 Q 29.5 57.5 27.5 53 Z" fill="#ffffff" />
        <path d="M 72.5 53 Q 66.5 52 64.5 56.5 Q 70.5 57.5 72.5 53 Z" fill="#ffffff" />

        {/* Center Grill Bright Lime Lightning Bolt */}
        <path
          d="M 52.5 45.5 L 43.5 56.5 L 49 56.5 L 46.5 67.5 L 57.5 54.5 L 51.5 54.5 Z"
          fill="url(#boltGrad)"
        />
      </g>
    </svg>
  );
}
