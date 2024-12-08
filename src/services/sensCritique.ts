import axios from 'axios';

interface SensCritiqueResult {
  title: string;
  author: string;
  rating?: number;
  url?: string;
  id?: string;
}

async function searchBookId(title: string, author: string): Promise<string | null> {
  try {
    const query = `${title} ${author}`.trim();
    const searchUrl = `https://www.senscritique.com/search?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    
    // Recherche l'ID du livre dans l'URL
    const bookUrlMatch = html.match(/href="\/livre\/[^\/]+\/(\d+)"/);
    return bookUrlMatch ? bookUrlMatch[1] : null;
  } catch (error) {
    console.error('Erreur lors de la recherche de l\'ID SensCritique:', error);
    return null;
  }
}

export async function searchBookSensCritique(title: string, author: string): Promise<SensCritiqueResult | null> {
  try {
    console.log('Recherche SensCritique pour:', { title, author });
    
    // Recherche d'abord l'ID du livre
    const bookId = await searchBookId(title, author);
    
    if (!bookId) {
      console.log('Aucun ID trouvé pour le livre');
      return null;
    }

    // Construction de l'URL avec l'ID
    const bookUrl = `https://www.senscritique.com/livre/titre/${bookId}`;
    
    // Récupération de la page du livre
    const response = await axios.get(bookUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;

    // Extraction de la note moyenne
    const ratingMatch = html.match(/class="[^"]*rating[^"]*">([0-9,.]+)<\/span>/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1].replace(',', '.')) : undefined;

    console.log('SensCritique - Livre trouvé:', { title, author, rating, bookUrl, bookId });

    return {
      title,
      author,
      rating,
      url: bookUrl,
      id: bookId
    };
  } catch (error) {
    console.error('Erreur lors de la recherche SensCritique:', error);
    return null;
  }
}