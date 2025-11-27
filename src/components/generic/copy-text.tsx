'use client';

import clsx from 'clsx';
import React, { useState } from 'react';

type CopyTextProps = {
  text: string;
  copyText?: string;
  showFeedback?: boolean;
  className?: string;
};

export function CopyText({
  text,
  copyText = text,
  showFeedback = true,
  className = '',
}: CopyTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      if (showFeedback) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`items-center gap-1 ${className}`}>
      <div className="relative h-5 -translate-x-1 overflow-hidden">
        <div
          className={clsx(
            'transition-transform duration-300',
            copied ? '-translate-y-1/2' : 'translate-y-0',
          )}
        >
          <button
            onClick={handleCopy}
            className="font-mono hover:bg-muted-foreground/50 px-1 rounded cursor-pointer"
          >
            {text}
          </button>
          <div className="text-green-800 px-1 rounded bg-green-200 w-fit">
            Copied!
          </div>
        </div>
      </div>
    </div>
  );
}
