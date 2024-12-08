import masculinFirstNames from '../data/Noms propres, prénoms français, masculins.json';
import femininFirstNames from '../data/Noms propres, prénoms français, féminins.json';

const firstNames = new Set([...masculinFirstNames, ...femininFirstNames]);

// Normalise un nom en retirant les accents et en mettant en minuscules
function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Vérifie si un mot ressemble à un prénom connu
export function isKnownFirstName(word: string): boolean {
  const normalizedWord = normalizeName(word);
  return firstNames.has(normalizedWord) || 
         [...firstNames].some(name => 
           normalizeName(name) === normalizedWord
         );
}

// Vérifie si une chaîne ressemble à un nom d'auteur
export function validateAuthorName(text: string): boolean {
  // Nettoie et sépare les mots
  const words = text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 1);

  if (words.length < 2) return false;

  // Vérifie si au moins un des mots est un prénom connu
  const hasFirstName = words.some(word => isKnownFirstName(word));
  
  // Vérifie si tous les mots commencent par une majuscule
  const allCapitalized = words.every(word => /^[A-ZÀ-Ű]/.test(word));

  return hasFirstName && allCapitalized;
}