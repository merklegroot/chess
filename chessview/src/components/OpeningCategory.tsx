import Link from 'next/link';
import EcoItemInfo from '@/components/EcoItemInfo';
import { chessOpeningWithVariantsModel } from '@/models/chessOpeningModel';
interface OpeningCategoryProps {
  category: string;
  openings: chessOpeningWithVariantsModel[];
}

export default function OpeningCategory({ category, openings }: OpeningCategoryProps) {
  return (
    <div>
      <EcoItemInfo eco={category} />
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
  );
} 