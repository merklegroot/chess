'use client';

import { useState } from 'react';

interface GameJsonViewerProps {
  game: any;
}

export default function GameJsonViewer({ game }: GameJsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-8 border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
      >
        <span className="font-medium">Game Data</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <pre className="p-4 bg-gray-50 overflow-auto max-h-96 text-sm">
          {JSON.stringify(game, null, 2)}
        </pre>
      )}
    </div>
  );
} 