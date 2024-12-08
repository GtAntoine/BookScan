import { isKnownWord } from './wordValidation';
import { isKnownFirstName } from './nameValidation';

// Vérifie si un texte est déjà bien formaté
export function isWellFormatted(text: string): boolean {
  // Vérifie si le texte contient des mots qui commencent par une majuscule
  const words = text.split(/\s+/);
  const properWords = words.filter(word => /^[A-ZÀ-Ű][a-zà-ÿ]+/.test(word));
  
  // Si plus de la moitié des mots sont bien formatés, on considère que le texte l'est
  return properWords.length >= words.length / 2;
}

// Trouve les meilleures séparations possibles pour un mot
function findWordSeparations(word: string): string[] {
  const separations: string[] = [];
  const len = word.length;

  // Essaie toutes les combinaisons possibles de séparation
  for (let i = 2; i < len - 1; i++) {
    const firstPart = word.slice(0, i).toLowerCase();
    const secondPart = word.slice(i).toLowerCase();

    // Vérifie si les deux parties sont des mots valides
    if (isKnownWord(firstPart) && isKnownWord(secondPart)) {
      separations.push(`${firstPart} ${secondPart}`);
    }

    // Essaie aussi avec trois parties
    for (let j = i + 2; j < len - 1; j++) {
      const middlePart = word.slice(i, j).toLowerCase();
      const lastPart = word.slice(j).toLowerCase();

      if (isKnownWord(firstPart) && isKnownWord(middlePart) && isKnownWord(lastPart)) {
        separations.push(`${firstPart} ${middlePart} ${lastPart}`);
      }
    }
  }

  return separations;
}

// Sépare un mot composé en utilisant les dictionnaires
function separateCompoundWord(word: string): string {
  // Si le mot est déjà bien formaté ou trop court, on le retourne tel quel
  if (/^[A-ZÀ-Ű][a-zà-ÿ]+$/.test(word) || word.length < 4) return word;
  
  // Si le mot contient des espaces, on le retourne tel quel
  if (word.includes(' ')) return word;

  // Essaie de trouver des séparations valides
  const separations = findWordSeparations(word);
  if (separations.length > 0) {
    // Prend la séparation qui donne le plus de mots valides
    const bestSeparation = separations.reduce((best, current) => {
      const bestWords = best.split(' ').filter(w => isKnownWord(w)).length;
      const currentWords = current.split(' ').filter(w => isKnownWord(w)).length;
      return currentWords > bestWords ? current : best;
    });
    
    // Capitalise chaque mot
    return bestSeparation
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  
  // Si le mot est tout en majuscules, essaie de le normaliser
  if (/^[A-ZÀ-Ű]+$/.test(word)) {
    const normalized = word.charAt(0) + word.slice(1).toLowerCase();
    if (isKnownWord(normalized) || isKnownFirstName(normalized)) {
      return normalized;
    }
  }
  
  // Si le mot contient des majuscules internes, essaie de le séparer
  if (/[a-z][A-Z]/.test(word)) {
    const separated = word.replace(/([a-z])([A-Z])/g, '$1 $2');
    const parts = separated.split(' ');
    if (parts.every(part => isKnownWord(part.toLowerCase()) || isKnownFirstName(part))) {
      return separated;
    }
  }
  
  return word;
}

// Traite une ligne complète pour séparer les mots composés
export function processCompoundWords(text: string): string {
  // Si le texte est déjà bien formaté, on le retourne tel quel
  if (isWellFormatted(text)) {
    console.log('Texte déjà bien formaté:', text);
    return text;
  }

  const words = text.split(/\s+/);
  const processedWords = words.map(word => {
    // On ne traite que les mots qui semblent mal formatés
    if (/[a-z][A-Z]/.test(word) || /^[A-Z]{2,}/.test(word) || word.length > 10) {
      const processed = separateCompoundWord(word);
      if (processed !== word) {
        console.log('Mot traité:', word, '→', processed);
      }
      return processed;
    }
    return word;
  });

  return processedWords.join(' ');
}