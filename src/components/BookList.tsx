import React from 'react';
import { Book, DetectedBook } from '../types/Book';
import { Star, Plus, BookOpen, CheckSquare } from 'lucide-react';

interface BookListProps {
  books: DetectedBook[];
  onAddToList?: (book: Book) => void;
}

export function BookList({ books, onAddToList }: BookListProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {books.map((book, index) => (
        <div 
          key={index}
          className="book-card p-6"
        >
          <div className="flex gap-6">
            {book.coverUrl && (
              <img 
                src={book.coverUrl} 
                alt={book.title}
                className="w-24 h-36 object-cover rounded-lg book-shadow"
              />
            )}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-library-wood">{book.title}</h3>
                  <p className="text-amber-900">{book.author}</p>
                </div>
                {book.inReadingList ? (
                  <div className="flex items-center gap-2 text-amber-700">
                    {book.isRead ? (
                      <>
                        <CheckSquare className="w-5 h-5" />
                        <span className="text-sm font-medium">Déjà lu</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-5 h-5" />
                        <span className="text-sm font-medium">À lire</span>
                      </>
                    )}
                  </div>
                ) : onAddToList && (
                  <button
                    onClick={() => onAddToList(book)}
                    className="p-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors"
                    title="Ajouter à ma liste"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {book.rating && (
                <div className="flex items-center gap-1 mt-3">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-amber-700 font-medium">{book.rating}/5</span>
                </div>
              )}
              
              {book.description && (
                <p className="text-gray-700 mt-3 text-sm line-clamp-2">
                  {book.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}