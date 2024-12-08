import axios from 'axios';
import { Book } from '../types/Book';

const BABELIO_API = 'https://www.babelio.com/api/v1';

export async function searchBookBabelio(query: string): Promise<Book | null> {
  try {
    const response = await axios.get(`${BABELIO_API}/search`, {
      params: {
        q: query,
        lang: 'fr'
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      const book = response.data.items[0];
      return {
        title: book.title,
        author: book.author,
        rating: book.rating,
        description: book.description,
        coverUrl: book.cover,
        isbn: book.isbn
      };
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la recherche Babelio:', error);
    return null;
  }
}