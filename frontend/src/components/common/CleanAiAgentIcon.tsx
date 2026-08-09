'use client';

import React from 'react';

interface CleanAiAgentIconProps {
  className?: string;
  size?: number;
}

export function CleanAiAgentIcon({ className = '', size = 24 }: CleanAiAgentIconProps) {
  return (
    <img
      src="/glo.jpeg"
      alt="Glo AI Logo"
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`rounded-full object-cover shrink-0 ${className}`}
    />
  );
}
