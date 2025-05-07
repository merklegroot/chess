import { ChessOpeningRepo } from '@/repo/chessOpeningRepo';
import OpeningCategory from '@/components/OpeningCategory';

export default function BookListPage() {
  const repo = ChessOpeningRepo.getInstance();
  const categories = repo.listOpeningsByCategory();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Chess Openings</h1>

        <div className="space-y-8">
          {Object.entries(categories).map(([category, openings]) => (
            <OpeningCategory
              key={category}
              category={category}
              openings={openings}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 