import Link from 'next/link';
import { ChessOpeningRepo } from '@/repo/chessOpeningRepo';
import EcoItemInfo from '@/components/EcoItemInfo';

export default function BookListPage() {
  const repo = ChessOpeningRepo.getInstance();
  const categories = repo.getOpeningsByCategory();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Chess Openings</h1>

        <div className="space-y-8">
          {Object.entries(categories).map(([category, openings]) => (
            <div key={category}>
              <EcoItemInfo eco={category} />
              <h2 className="text-2xl font-semibold mb-4">
                Category {category.toUpperCase()}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {openings.map((opening) => (
                  <Link
                    key={`${opening.eco}-${opening.pgn}`}
                    href={`/book/details/${opening.eco}`}
                    className="block p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium">{opening.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      ECO: {opening.eco}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 font-mono">
                      {opening.pgn}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 