import masculinWords from '../data/Noms communs, masculin singulier (simplifié).json';
import femininWords from '../data/Noms communs, féminin singulier (simplifié).json';

const knownWords = new Set([...masculinWords, ...femininWords]);

// Normalise un mot en retirant les accents et en mettant en minuscules
function normalizeWord(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Vérifie si un mot est connu dans le dictionnaire
export function isKnownWord(word: string): boolean {
  const normalizedWord = normalizeWord(word);
  return knownWords.has(normalizedWord) || 
         [...knownWords].some(knownWord => 
           normalizeWord(knownWord) === normalizedWord
         );
}