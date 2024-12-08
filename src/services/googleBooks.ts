import axios from 'axios';
import { Book } from '../types/Book';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

function buildSearchQuery(bookText: string): string {
  const parts = bookText.split(/\s+(?:de|par)\s+/);
  
  if (parts.length === 2) {
    const [title, author] = parts;
    return `intitle:"${title}" inauthor:"${author}"`;
  }
  
  return `"${bookText}"`;
}

function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function scoreResult(book: any, searchText: string): number {
  let score = 0;
  const searchParts = searchText.toLowerCase().split(/\s+(?:de|par)\s+/);
  const searchTitle = searchParts[0];
  const searchAuthor = searchParts[1];
  
  const titleLower = book.title?.toLowerCase() || '';
  const authorLower = book.authors?.[0]?.toLowerCase() || '';

  const normalizedSearchTitle = normalizeText(searchTitle);
  const normalizedSearchAuthor = searchAuthor ? normalizeText(searchAuthor) : '';
  const normalizedTitle = normalizeText(titleLower);
  const normalizedAuthor = normalizeText(authorLower);

  // Score pour correspondance exacte
  if (normalizedTitle === normalizedSearchTitle) score += 15;
  if (normalizedSearchAuthor && normalizedAuthor === normalizedSearchAuthor) score += 15;

  // Score pour correspondance partielle
  const searchWords = normalizedSearchTitle.split(/\s+/);
  const titleWords = normalizedTitle.split(/\s+/);
  
  // Compte les mots en commun
  const commonWords = searchWords.filter(word => 
    titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
  );
  
  score += (commonWords.length / Math.max(searchWords.length, titleWords.length)) * 10;

  if (normalizedSearchAuthor) {
    const authorWords = normalizedAuthor.split(/\s+/);
    const searchAuthorWords = normalizedSearchAuthor.split(/\s+/);
    const commonAuthorWords = searchAuthorWords.filter(word =>
      authorWords.some(authorWord => authorWord.includes(word) || word.includes(authorWord))
    );
    score += (commonAuthorWords.length / Math.max(searchAuthorWords.length, authorWords.length)) * 10;
  }

  // Bonus pour les livres avec plus d'informations
  if (book.description) score += 1;
  if (book.imageLinks?.thumbnail) score += 1;
  if (book.averageRating) score += 1;

  return score;
}

export async function searchBook(bookText: string): Promise<Book | null> {
  try {
    console.log('\n=== Recherche Google Books ===');
    console.log('Texte recherché:', bookText);
    
    const query = buildSearchQuery(bookText);
    console.log('Requête construite:', query);
    
    const response = await axios.get(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&langRestrict=fr&maxResults=5`
    );
    
    let results = response.data.items || [];
    
    if (results.length === 0) {
      console.log('Aucun résultat trouvé avec la recherche exacte');
      
      const parts = bookText.split(/\s+(?:de|par)\s+/);
      if (parts.length === 2) {
        const [title, author] = parts;
        const broadQuery = `${title} ${author}`;
        console.log('Tentative avec recherche élargie:', broadQuery);
        
        const broadResponse = await axios.get(
          `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(broadQuery)}&langRestrict=fr&maxResults=5`
        );
        results = broadResponse.data.items || [];
      }
    }

    if (results.length === 0) {
      console.log('Aucun résultat trouvé');
      return null;
    }

    console.log('\nRésultats bruts:');
    results.forEach((item: any, index: number) => {
      const book = item.volumeInfo;
      console.log(`\n[${index + 1}] ${book.title}`);
      console.log(`   Auteur: ${book.authors?.[0] || 'Inconnu'}`);
      console.log(`   Note: ${book.averageRating || 'N/A'}`);
    });

    const scoredResults = results
      .map((item: any) => ({
        item,
        score: scoreResult(item.volumeInfo, bookText)
      }))
      .sort((a: any, b: any) => b.score - a.score)
      .filter((result: any) => result.score > 5); // Seuil minimum de pertinence abaissé

    console.log('\nRésultats avec scores:');
    scoredResults.forEach((result: any, index: number) => {
      const book = result.item.volumeInfo;
      console.log(`\n[${index + 1}] Score: ${result.score}`);
      console.log(`   Titre: ${book.title}`);
      console.log(`   Auteur: ${book.authors?.[0] || 'Inconnu'}`);
    });

    if (scoredResults.length === 0) {
      console.log('Aucun résultat pertinent trouvé');
      return null;
    }

    const bestMatch = scoredResults[0].item.volumeInfo;
    console.log('\nMeilleure correspondance:');
    console.log('Titre:', bestMatch.title);
    console.log('Auteur:', bestMatch.authors?.[0] || 'Inconnu');
    console.log('Score:', scoredResults[0].score);
    
    return {
      title: bestMatch.title,
      author: bestMatch.authors ? bestMatch.authors[0] : 'Auteur inconnu',
      rating: bestMatch.averageRating,
      description: bestMatch.description,
      coverUrl: bestMatch.imageLinks?.thumbnail?.replace('http:', 'https:'),
      isbn: bestMatch.industryIdentifiers?.[0]?.identifier
    };
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    return null;
  }
}

export async function searchBookByISBN(isbn: string): Promise<Book | null> {
  try {
    console.log('Recherche par ISBN:', isbn);
    
    const response = await axios.get(
      `${GOOGLE_BOOKS_API}?q=isbn:${isbn}&langRestrict=fr`
    );
    
    if (response.data.items && response.data.items.length > 0) {
      const book = response.data.items[0].volumeInfo;
      
      return {
        title: book.title,
        author: book.authors ? book.authors[0] : 'Auteur inconnu',
        rating: book.averageRating,
        description: book.description,
        coverUrl: book.imageLinks?.thumbnail?.replace('http:', 'https:'),
        isbn
      };
    }

    return null;
  } catch (error) {
    console.error('Error searching book by ISBN:', error);
    return null;
  }
}