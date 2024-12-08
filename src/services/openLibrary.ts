import axios from 'axios';
import { Book } from '../types/Book';

const OPEN_LIBRARY_API = 'https://openlibrary.org';

interface OpenLibraryWork {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  ratings_average?: number;
}

interface OpenLibraryBookDetails {
  description?: {
    value?: string;
    text?: string;
  } | string;
  covers?: number[];
  authors?: Array<{name: string}>;
}

function buildSearchQuery(bookText: string): string {
  const parts = bookText.split(/\s+(?:de|par)\s+/);
  
  if (parts.length === 2) {
    const [title, author] = parts;
    return `title:"${title}" author:"${author}"`;
  }
  
  return bookText;
}

function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function scoreResult(work: OpenLibraryWork, searchText: string): number {
  let score = 0;
  const searchParts = searchText.toLowerCase().split(/\s+(?:de|par)\s+/);
  const searchTitle = searchParts[0];
  const searchAuthor = searchParts[1];
  
  const titleLower = work.title?.toLowerCase() || '';
  const authorLower = work.author_name?.[0]?.toLowerCase() || '';

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
  if (work.cover_i) score += 1;
  if (work.ratings_average) score += 1;
  if (work.first_publish_year) score += 1;

  return score;
}

async function getBookDetails(workKey: string): Promise<OpenLibraryBookDetails> {
  try {
    const response = await axios.get(`${OPEN_LIBRARY_API}${workKey}.json`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    return {};
  }
}

export async function searchBook(bookText: string): Promise<Book | null> {
  try {
    console.log('\n=== Recherche OpenLibrary ===');
    console.log('Texte recherché:', bookText);
    
    const query = buildSearchQuery(bookText);
    console.log('Requête construite:', query);
    
    const response = await axios.get(
      `${OPEN_LIBRARY_API}/search.json?q=${encodeURIComponent(query)}&language=fre&limit=5`
    );
    
    let results = response.data.docs || [];
    
    if (results.length === 0) {
      console.log('Aucun résultat trouvé avec la recherche exacte');
      return null;
    }

    console.log('\nRésultats bruts:');
    results.forEach((work: OpenLibraryWork, index: number) => {
      console.log(`\n[${index + 1}] ${work.title}`);
      console.log(`   Auteur: ${work.author_name?.[0] || 'Inconnu'}`);
      console.log(`   Note: ${work.ratings_average || 'N/A'}`);
    });

    const scoredResults = results
      .map((work: OpenLibraryWork) => ({
        work,
        score: scoreResult(work, bookText)
      }))
      .sort((a, b) => b.score - a.score)
      .filter(result => result.score > 5);

    console.log('\nRésultats avec scores:');
    scoredResults.forEach((result, index) => {
      console.log(`\n[${index + 1}] Score: ${result.score}`);
      console.log(`   Titre: ${result.work.title}`);
      console.log(`   Auteur: ${result.work.author_name?.[0] || 'Inconnu'}`);
    });

    if (scoredResults.length === 0) {
      console.log('Aucun résultat pertinent trouvé');
      return null;
    }

    const bestMatch = scoredResults[0].work;
    console.log('\nMeilleure correspondance:');
    console.log('Titre:', bestMatch.title);
    console.log('Auteur:', bestMatch.author_name?.[0] || 'Inconnu');
    console.log('Score:', scoredResults[0].score);

    // Récupère les détails supplémentaires
    const details = await getBookDetails(bestMatch.key);
    
    return {
      title: bestMatch.title,
      author: bestMatch.author_name?.[0] || 'Auteur inconnu',
      rating: bestMatch.ratings_average,
      description: typeof details.description === 'string' 
        ? details.description 
        : details.description?.value || details.description?.text,
      coverUrl: bestMatch.cover_i 
        ? `https://covers.openlibrary.org/b/id/${bestMatch.cover_i}-L.jpg`
        : undefined
    };
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    return null;
  }
}