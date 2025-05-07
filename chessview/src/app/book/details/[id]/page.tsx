import { allBooks } from '@/constants/books/allBooks';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default function BookDetailsPage({ params }: PageProps) {
  const book = allBooks[parseInt(params.id)];

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-4">
          <h1 className="text-2xl font-bold mb-4">Book Not Found</h1>
          <Link href="/book/list" className="text-blue-600 hover:text-blue-800">
            ← Back to Books
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
            ← Back to Books
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">{book.title}</h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Base Moves</h2>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-mono text-sm">{book.baseMoves.join(' ')}</div>
            </div>
          </div>

          {book.variants && book.variants.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Variants</h2>
              <div className="space-y-4">
                {book.variants.map((variant) => (
                  <div key={variant.id} className="bg-gray-50 p-4 rounded">
                    <h3 className="text-lg font-medium mb-2">{variant.title}</h3>
                    <div className="font-mono text-sm">
                      {[...book.baseMoves, ...variant.movesAfterBase].join(' ')}
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