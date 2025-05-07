import Link from 'next/link';
import { ChessOpeningRepo } from '@/repo/chessOpeningRepo';

interface PageProps {
  params: { id: string };
}

export default function BookDetailsPage({ params }: PageProps) {
  const repo = ChessOpeningRepo.getInstance();
  const opening = repo.getOpeningById(params.id);
  const mainOpenings = repo.getOpeningsByMainName();
  const mainName = opening ? opening.name.split(/[:,]/)[0].trim() : '';
  const variations = opening ? mainOpenings[mainName]?.filter(v => v.eco !== opening.eco) : [];

  if (!opening) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-4">
          <h1 className="text-2xl font-bold mb-4">Opening Not Found</h1>
          <Link href="/book/list" className="text-blue-600 hover:text-blue-800">
            ← Back to Openings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/book/list" className="text-blue-600 hover:text-blue-800">
            ← Back to Openings
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">{opening.name}</h1>
        <div className="text-gray-600 mb-6">ECO: {opening.eco}</div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Moves</h2>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-mono text-sm">{opening.pgn}</div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Position</h2>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-mono text-sm">{opening.epd}</div>
            </div>
          </div>

          {variations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Related Variations</h2>
              <div className="space-y-4">
                {variations.map((variation) => (
                  <div key={variation.eco} className="bg-gray-50 p-4 rounded">
                    <h3 className="text-lg font-medium mb-2">{variation.name}</h3>
                    <div className="text-sm text-gray-600 mb-2">
                      ECO: {variation.eco}
                    </div>
                    <div className="font-mono text-sm">
                      {variation.pgn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 