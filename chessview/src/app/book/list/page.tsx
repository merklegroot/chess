import React from 'react';
import Link from 'next/link';
import { allBooks } from '@/constants/books/allBooks';

export default function BookList() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chess Books</h1>
      <div className="space-y-4">
        {allBooks.map((book, index) => (
          <Link 
            key={index}
            href={`/book/details/${index}`}
            className="block bg-white shadow rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
            <div className="text-sm text-gray-600">
              Base moves: {book.baseMoves.join(' ')}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 