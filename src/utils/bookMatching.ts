import { Book } from '../types/Book';

// Nettoie le texte pour la comparaison
function cleanForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Vérifie si deux chaînes sont similaires
function areSimilar(str1: string, str2: string): boolean {
  const s1 = cleanForComparison(str1);
  const s2 = cleanForComparison(str2);
  
  // Vérifie l'inclusion directe
  if (s1.includes(s2) || s2.includes(s1)) {
    return true;
  }
  
  // Compare les mots individuels
  const words1 = new Set(s1.split(' '));
  const words2 = new Set(s2.split(' '));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  
  // Calcule le pourcentage de mots en commun
  const matchPercentage = (intersection.size * 2) / (words1.size + words2.size);
  
  // Augmente la tolérance pour la correspondance
  return matchPercentage >= 0.6; // Réduit le seuil de 0.75 à 0.6
}

// Vérifie si une ligne correspond à un livre
function matchesBook(line: string, book: Book): boolean {
  // Crée une version complète du titre avec l'auteur
  const fullTitle = `${book.title} ${book.author}`;
  
  // Nettoie la ligne détectée
  const cleanedLine = line
    .replace(/^\d+\s+/, '') // Supprime les nombres au début
    .replace(/[|@#$%^&*]+$/, ''); // Supprime les caractères spéciaux à la fin
  
  // Essaie différentes combinaisons pour la correspondance
  return areSimilar(cleanedLine, fullTitle) || 
         areSimilar(cleanedLine, book.title) ||
         areSimilar(cleanedLine, book.author) ||
         // Vérifie aussi les parties du titre séparément
         book.title.split(' ').some(part => 
           part.length > 3 && cleanedLine.toLowerCase().includes(part.toLowerCase())
         );
}

export function findMatchingBooks(
  detectedText: string,
  toReadList: Book[],
  readList: Book[]
): { matches: Book[]; isRead: boolean[]; remainingLines: string[] } {
  const matches: Book[] = [];
  const isRead: boolean[] = [];
  const remainingLines: string[] = [];
  
  // Traite chaque ligne du texte détecté
  const lines = detectedText.split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    console.log('Analyse de la ligne:', line);
    
    // Cherche d'abord dans la liste à lire
    const toReadMatch = toReadList.find(book => matchesBook(line, book));
    if (toReadMatch) {
      console.log('Livre trouvé dans la liste à lire:', toReadMatch.title);
      matches.push(toReadMatch);
      isRead.push(false);
      continue;
    }
    
    // Puis dans la liste des livres lus
    const readMatch = readList.find(book => matchesBook(line, book));
    if (readMatch) {
      console.log('Livre trouvé dans la liste des livres lus:', readMatch.title);
      matches.push(readMatch);
      isRead.push(true);
      continue;
    }

    // Si aucune correspondance n'est trouvée, ajoute la ligne aux lignes restantes
    remainingLines.push(line);
  }
  
  return { matches, isRead, remainingLines };
}