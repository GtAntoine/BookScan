import React, { useState, useEffect } from 'react';
import { BookList } from '../components/BookList';
import { ReadingLists } from '../components/ReadingLists';
import { Book, ReadingList, DetectedBook } from '../types/Book';
import { Camera } from '../components/Camera';
import { Loader2 } from 'lucide-react';

// Données de démo pré-remplies
const DEMO_READING_LISTS: ReadingList = {
  toRead: [{
    id: '1',
    title: 'Je me suis tue',
    author: 'Mathieu Menegaux',
  }],
  read: [
    {
      id: '2',
      title: 'Le Montespan',
      author: 'Jean Teulé',
    },
    {
      id: '3',
      title: 'La beauté du ciel',
      author: 'Sarah Biasini',
    }
  ]
};

export function DemoApp() {
  const [books, setBooks] = useState<DetectedBook[]>([]);
  const [processing, setProcessing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [readingLists, setReadingLists] = useState<ReadingList>(DEMO_READING_LISTS);

  const handleTextExtracted = async (text: string) => {
    // Simulation de la recherche pour la démo
    setSearching(true);
    setTimeout(() => {
      const demoBooks: DetectedBook[] = [
        {
          title: 'Je me suis tue',
          author: 'Mathieu Menegaux',
          inReadingList: true,
          isRead: false,
        },
        {
          title: '84, Charing Cross Road',
          author: 'Helene Hanff',
          inReadingList: false,
          isRead: false,
        },
        {
          title: 'La Grande Arche',
          author: 'Laurence Cossé',
          inReadingList: false,
          isRead: false,
        },
        {
          title: 'Il était une ville',
          author: 'Thomas B. Reverdy',
          inReadingList: false,
          isRead: false,
        }
      ];
      setBooks(demoBooks);
      setSearching(false);
    }, 2000);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Mode Démonstration</h2>
        <p className="text-gray-700 mb-4">
          Ce mode utilise une image pré-définie et des listes pré-remplies pour démontrer les fonctionnalités de l'application.
        </p>
        <div className="space-y-2 text-gray-600">
          <p>• "Je me suis tue" de Mathieu Menegaux est dans la liste "À lire"</p>
          <p>• "Le Montespan" de Jean Teulé et "La beauté du ciel" de Sarah Biasini sont dans "Déjà lu"</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
        <div>
          <div className="bg-white p-4 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold mb-4">Image de démonstration</h3>
            <img 
              src="/src/data/demo-easy.JPEG"
              alt="Exemple de livres à scanner"
              className="w-full rounded-lg"
            />
          </div>

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
              <BookList books={books} />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Mes Listes</h2>
          <ReadingLists
            toRead={readingLists.toRead}
            read={readingLists.read}
            onMoveToRead={() => {}}
            onRemoveFromToRead={() => {}}
            onRemoveFromRead={() => {}}
            onImportToRead={() => {}}
            onImportRead={() => {}}
          />
        </div>
      </div>
    </main>
  );
}