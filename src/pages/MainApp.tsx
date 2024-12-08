import React, { useState, useEffect } from 'react';
import { Camera } from '../components/Camera';
import { BookList } from '../components/BookList';
import { ReadingLists } from '../components/ReadingLists';
import { Book, ReadingList, DetectedBook } from '../types/Book';
import { extractBookCandidates } from '../utils/textProcessing';
import { searchBook } from '../services/bookSearch';
import { findMatchingBooks } from '../utils/bookMatching';
import { AlertCircle, Loader2 } from 'lucide-react';

const READING_LISTS_KEY = 'readingLists';

export function MainApp() {
  const [books, setBooks] = useState<DetectedBook[]>([]);
  const [processing, setProcessing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [readingLists, setReadingLists] = useState<ReadingList>(() => {
    const saved = localStorage.getItem(READING_LISTS_KEY);
    return saved ? JSON.parse(saved) : { toRead: [], read: [] };
  });

  useEffect(() => {
    localStorage.setItem(READING_LISTS_KEY, JSON.stringify(readingLists));
  }, [readingLists]);

  const handleTextExtracted = async (text: string) => {
    setSearching(true);
    try {
      const { matches, isRead, remainingLines } = findMatchingBooks(
        text,
        readingLists.toRead,
        readingLists.read
      );

      const matchedBooks: DetectedBook[] = matches.map((book, index) => ({
        ...book,
        inReadingList: true,
        isRead: isRead[index]
      }));

      const detectedBooks = extractBookCandidates(remainingLines.join('\n'));
      console.log('Livres à rechercher:', detectedBooks);

      const searchPromises = detectedBooks.map(async (bookText) => {
        const book = await searchBook(bookText);
        if (!book) return null;

        return {
          ...book,
          inReadingList: false,
          isRead: false
        };
      });

      const searchResults = await Promise.all(searchPromises);
      const foundBooks = searchResults.filter((book): book is DetectedBook => book !== null);

      setBooks([...matchedBooks, ...foundBooks]);
    } finally {
      setSearching(false);
    }
  };

  const addToReadingList = (book: Book) => {
    const bookWithId = { ...book, id: Date.now().toString() + Math.random() };
    setReadingLists(prev => ({
      ...prev,
      toRead: [...prev.toRead, bookWithId]
    }));
    setBooks(prev => prev.map(b => 
      b.title === book.title && b.author === book.author
        ? { ...b, inReadingList: true, isRead: false }
        : b
    ));
  };

  const moveToRead = (book: Book) => {
    setReadingLists(prev => ({
      toRead: prev.toRead.filter(b => b.id !== book.id),
      read: [...prev.read, book]
    }));
  };

  const removeFromToRead = (book: Book) => {
    setReadingLists(prev => ({
      ...prev,
      toRead: prev.toRead.filter(b => b.id !== book.id)
    }));
  };

  const removeFromRead = (book: Book) => {
    setReadingLists(prev => ({
      ...prev,
      read: prev.read.filter(b => b.id !== book.id)
    }));
  };

  const handleImportToRead = (books: Book[]) => {
    setReadingLists(prev => ({
      ...prev,
      toRead: [...prev.toRead, ...books]
    }));
  };

  const handleImportRead = (books: Book[]) => {
    setReadingLists(prev => ({
      ...prev,
      read: [...prev.read, ...books]
    }));
  };

  const totalBooks = readingLists.toRead.length + readingLists.read.length;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {totalBooks < 5 && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-700">
              Pour une meilleure expérience, commencez par importer vos listes de lecture.<br />
              Essayez d'avoir maximum 10 livres sur la photo.
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Utilisez les boutons "Importer une liste" dans la section "Mes Listes" à droite.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
        <div>
          <Camera 
            onTextExtracted={handleTextExtracted}
            onProcessing={setProcessing}
          />

          {(processing || searching) && (
            <div className="flex items-center justify-center gap-2 my-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p>{processing ? "Analyse de l'image en cours..." : "Recherche des livres..."}</p>
            </div>
          )}

          {books.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                Livres trouvés ({books.length})
              </h2>
              <BookList 
                books={books}
                onAddToList={addToReadingList}
              />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Mes Listes</h2>
          <ReadingLists
            toRead={readingLists.toRead}
            read={readingLists.read}
            onMoveToRead={moveToRead}
            onRemoveFromToRead={removeFromToRead}
            onRemoveFromRead={removeFromRead}
            onImportToRead={handleImportToRead}
            onImportRead={handleImportRead}
          />
        </div>
      </div>
    </main>
  );
}