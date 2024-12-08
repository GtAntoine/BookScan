import React, { useState } from 'react';
import { Book } from '../types/Book';
import { searchBook } from '../services/googleBooks';
import { ListPlus, Loader2 } from 'lucide-react';

interface BookListImportProps {
  onBooksImported: (books: Book[]) => void;
  type: 'toRead' | 'read';
}

export function BookListImport({ onBooksImported, type }: BookListImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [bookList, setBookList] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    if (!bookList.trim()) return;

    setIsLoading(true);
    try {
      const books = bookList
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const foundBooks = await Promise.all(
        books.map(async (book) => {
          const result = await searchBook(book);
          if (result) {
            return { ...result, id: Date.now().toString() + Math.random() };
          }
          return null;
        })
      );

      const validBooks = foundBooks.filter((book): book is Book => book !== null);
      onBooksImported(validBooks);
      setBookList('');
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
      >
        <ListPlus size={20} />
        Importer une liste de livres {type === 'read' ? 'lus' : 'à lire'}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <textarea
            value={bookList}
            onChange={(e) => setBookList(e.target.value)}
            placeholder="Entrez vos livres (un par ligne)"
            className="w-full h-32 p-2 border rounded-lg resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleImport}
              disabled={isLoading || !bookList.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importation...
                </>
              ) : (
                <>
                  <ListPlus size={20} />
                  Importer
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}