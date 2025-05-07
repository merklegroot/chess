'use client';

import Link from 'next/link';
import EcoItemInfo from '@/components/EcoItemInfo';
import { chessOpeningModel } from '@/models/chessOpeningModel';
import { useState } from 'react';

interface OpeningCategoryProps {
  category: string;
  openings: chessOpeningModel[];
}

export default function OpeningCategory({ category, openings }: OpeningCategoryProps) {
  return (
    <div>
      <EcoItemInfo eco={category} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {openings.map((opening) => (
          <OpeningListItem key={`${opening.eco}-${opening.pgn}`} opening={opening} />
        ))}
      </div>
    </div>
  );
}

function OpeningListItem({ opening }: { opening: chessOpeningModel }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="block p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between">
        <Link
          href={`/book/details/${opening.id}`}
          className="flex-grow"
        >
          <div className="font-medium">{opening.name}</div>
          <div className="text-sm text-gray-600 mt-1">
            ECO: {opening.eco}
          </div>
          <div className="text-sm text-gray-500 mt-1 font-mono">
            {opening.pgn}
          </div>
        </Link>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-4 p-1 hover:bg-gray-200 rounded transition-transform"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
      {isExpanded && (
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-gray-100 rounded">
            <div className="text-sm font-medium text-gray-700 mb-1">Native Data:</div>
            <div className="font-mono text-xs text-gray-600 whitespace-pre-wrap">
              {opening.native}
            </div>
          </div>
          <pre className="p-3 bg-gray-100 rounded text-xs overflow-x-auto">
            {JSON.stringify(opening, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 