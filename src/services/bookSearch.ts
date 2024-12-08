import { searchBook as searchOpenLibrary } from './openLibrary';
import { Book } from '../types/Book';

export async function searchBook(bookText: string): Promise<Book | null> {
  try {
    // Recherche uniquement sur OpenLibrary
    const openLibraryResult = await searchOpenLibrary(bookText);
    
    if (openLibraryResult) {
      console.log('Livre trouvé sur OpenLibrary:', openLibraryResult);
      return openLibraryResult;
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    return null;
  }
}