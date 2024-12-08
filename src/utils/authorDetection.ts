import { isKnownFirstName } from './nameValidation';

// Sépare un nom collé en prénom et nom
export function splitAuthorName(text: string): string {
  // Gère les cas comme "JeanTeulé"
  const words = text.split(/(?=[A-Z][a-z])/).filter(word => word.length > 0);
  return words.join(' ').trim();
}

// Vérifie si un texte ressemble à un nom d'auteur
export function looksLikeAuthor(text: string): boolean {
  const words = text.split(/\s+/).filter(word => word.length > 1);
  if (words.length < 2) return false;
  
  // Vérifie si au moins un mot est un prénom connu
  const hasFirstName = words.some(word => isKnownFirstName(word));
  
  // Vérifie si les mots commencent par une majuscule
  const allCapitalized = words.every(word => /^[A-ZÀ-Ű]/.test(word));
  
  // Vérifie qu'il n'y a pas trop de mots (un nom d'auteur a rarement plus de 4 mots)
  const hasReasonableLength = words.length <= 4;
  
  return hasFirstName && allCapitalized && hasReasonableLength;
}

// Extrait le nom d'auteur d'une ligne
export function extractAuthor(line: string): string | null {
  // Gère les cas où le prénom et le nom sont collés (ex: JeanTeulé)
  const words = line.split(/\s+/);
  const processedWords = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word.length > 3 && /^[A-Z]/.test(word)) {
      const split = splitAuthorName(word);
      if (split !== word) {
        processedWords.push(...split.split(' '));
        continue;
      }
    }
    processedWords.push(word);
  }
  
  // Essaie différentes combinaisons de mots pour trouver un auteur valide
  for (let i = 0; i < processedWords.length - 1; i++) {
    for (let j = i + 1; j <= Math.min(i + 3, processedWords.length); j++) {
      const potentialAuthor = processedWords.slice(i, j).join(' ');
      if (looksLikeAuthor(potentialAuthor)) {
        return potentialAuthor;
      }
    }
  }
  
  return null;
}