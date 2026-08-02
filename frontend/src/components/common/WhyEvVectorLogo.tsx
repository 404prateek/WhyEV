'use client';

import React from 'react';

interface WhyEvVectorLogoProps {
  className?: string;
  size?: number;
}

export function WhyEvVectorLogo({ className = '', size = 36 }: WhyEvVectorLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="whyev-green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="whyev-bolt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Circular Speech Bubble Outer Ring */}
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="url(#whyev-green-grad)"
        stroke="#065f46"
        strokeWidth="2"
      />

      {/* Speech Bubble Tail Point */}
      <path
        d="M 20 74 L 10 90 L 32 82 Z"
        fill="url(#whyev-green-grad)"
      />

      {/* EV Car Silhouette Outline */}
      <path
        d="M 24 58 C 24 52, 28 44, 38 42 L 46 34 C 50 32, 62 32, 68 36 L 76 42 C 82 44, 84 50, 84 58 L 84 62 C 84 64, 82 66, 80 66 L 76 66 C 76 60, 70 56, 64 56 C 58 56, 52 60, 52 66 L 44 66 C 44 60, 38 56, 32 56 C 26 56, 20 60, 20 66 L 18 66 C 16 66, 14 64, 14 62 Z"
        fill="#ffffff"
        opacity="0.95"
      />

      {/* Left Car Wheel */}
      <circle cx="32" cy="64" r="6" fill="#064e3b" />
      <circle cx="32" cy="64" r="2.5" fill="#34d399" />

      {/* Right Car Wheel */}
      <circle cx="64" cy="64" r="6" fill="#064e3b" />
      <circle cx="64" cy="64" r="2.5" fill="#34d399" />

      {/* Central Flash Lightning Bolt */}
      <path
        d="M 52 24 L 40 46 L 50 46 L 44 68 L 62 42 L 50 42 Z"
        fill="url(#whyev-bolt-grad)"
        stroke="#ffffff"
        strokeWidth="1.5"
      />
    </svg>
  );
}
