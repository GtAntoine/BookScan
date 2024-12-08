import React from 'react';
import { Book } from '../types/Book';
import { BookList } from './BookList';
import { BookListImport } from './BookListImport';
import { Bookmark, CheckSquare, Trash2, MoveRight } from 'lucide-react';

interface ReadingListsProps {
  toRead: Book[];
  read: Book[];
  onMoveToRead: (book: Book) => void;
  onRemoveFromToRead: (book: Book) => void;
  onRemoveFromRead: (book: Book) => void;
  onImportToRead: (books: Book[]) => void;
  onImportRead: (books: Book[]) => void;
}

export function ReadingLists({
  toRead,
  read,
  onMoveToRead,
  onRemoveFromToRead,
  onRemoveFromRead,
  onImportToRead,
  onImportRead,
}: ReadingListsProps) {
  const [activeTab, setActiveTab] = React.useState<'toRead' | 'read'>('toRead');

  return (
    <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg p-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('toRead')}
          className={`list-tab ${activeTab === 'toRead' ? 'active' : ''}`}
        >
          <Bookmark className="w-5 h-5" />
          À lire ({toRead.length})
        </button>
        <button
          onClick={() => setActiveTab('read')}
          className={`list-tab ${activeTab === 'read' ? 'active' : ''}`}
        >
          <CheckSquare className="w-5 h-5" />
          Déjà lu ({read.length})
        </button>
      </div>

      {activeTab === 'toRead' && (
        <div className="animate-fade-in">
          <BookListImport onBooksImported={onImportToRead} type="toRead" />
          <div className="space-y-4">
            {toRead.map((book) => (
              <div 
                key={book.id} 
                className="book-card p-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-library-wood">{book.title}</h3>
                    <p className="text-amber-900">{book.author}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onMoveToRead(book)}
                      className="p-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors"
                      title="Marquer comme lu"
                    >
                      <MoveRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onRemoveFromToRead(book)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {toRead.length === 0 && (
              <p className="text-center text-amber-800 py-8 italic">
                Votre liste de lecture est vide
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'read' && (
        <div className="animate-fade-in">
          <BookListImport onBooksImported={onImportRead} type="read" />
          <div className="space-y-4">
            {read.map((book) => (
              <div 
                key={book.id} 
                className="book-card p-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-library-wood">{book.title}</h3>
                    <p className="text-amber-900">{book.author}</p>
                  </div>
                  <button
                    onClick={() => onRemoveFromRead(book)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {read.length === 0 && (
              <p className="text-center text-amber-800 py-8 italic">
                Vous n'avez pas encore de livres lus
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}