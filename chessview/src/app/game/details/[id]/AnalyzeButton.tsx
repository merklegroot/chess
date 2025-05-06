'use client';

interface AnalyzeButtonProps {
  gameId: string;
}

export default function AnalyzeButton({ gameId }: AnalyzeButtonProps) {
  return (
    <button
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      onClick={() => {
        // TODO: Implement game analysis
        console.log('Analyze game:', gameId);
      }}
    >
      Analyze Game
    </button>
  );
} 