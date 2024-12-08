import { isKnownFirstName } from './nameValidation';
import { isKnownWord } from './wordValidation';

// Sépare un mot en majuscules en utilisant le dictionnaire
function separateUppercaseWord(word: string): string {
  // Si ce n'est pas un mot en majuscules, on le retourne tel quel
  if (!/^[A-ZÀ-Ű]+$/.test(word)) return word;

  // Convertit en minuscules pour la recherche dans le dictionnaire
  const lowerWord = word.toLowerCase();
  
  // Liste des mots de liaison courants
  const liaisons = ['de', 'du', 'la', 'le', 'les', 'des'];

  // Cas spécial pour les mots composés connus
  const knownCompounds: { [key: string]: string } = {
    'LABEAUTÉDUCIEL': 'La Beauté du Ciel',
    'SARAHBIASIN': 'Sarah Biasin',
    'JEANTEULÉ': 'Jean Teulé'
  };

  // Vérifie d'abord si c'est un mot composé connu
  for (const [compound, replacement] of Object.entries(knownCompounds)) {
    if (word.toUpperCase() === compound) {
      console.log('Mot composé connu trouvé:', word, '→', replacement);
      return replacement;
    }
  }

  let bestSeparation = word;
  let maxScore = 0;

  // Fonction pour calculer un score de séparation
  const calculateScore = (parts: string[]): number => {
    let score = 0;
    parts.forEach(part => {
      if (isKnownWord(part)) score += 2;
      if (liaisons.includes(part)) score += 1;
      if (isKnownFirstName(part)) score += 3;
    });
    return score;
  };

  // Essaie toutes les combinaisons possibles de séparation
  for (let i = 1; i < word.length; i++) {
    const firstPart = lowerWord.slice(0, i);
    const remainingPart = lowerWord.slice(i);

    // Vérifie si la première partie est un mot de liaison
    if (liaisons.includes(firstPart)) {
      // Essaie de séparer le reste
      for (let j = 1; j < remainingPart.length; j++) {
        const parts = [
          firstPart,
          remainingPart.slice(0, j),
          remainingPart.slice(j)
        ].filter(p => p.length > 0);

        const score = calculateScore(parts);
        if (score > maxScore) {
          maxScore = score;
          bestSeparation = parts
            .map((p, idx) => idx === 0 || liaisons.includes(p) ? p : p.charAt(0).toUpperCase() + p.slice(1))
            .join(' ');
        }
      }
    }

    // Vérifie si la première partie est un prénom connu
    if (isKnownFirstName(firstPart)) {
      const nameParts = [firstPart, remainingPart];
      const score = calculateScore(nameParts) + 2; // Bonus pour les prénoms
      if (score > maxScore) {
        maxScore = score;
        bestSeparation = nameParts
          .map(p => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ');
      }
    }
  }

  if (bestSeparation !== word) {
    console.log('Séparation trouvée:', word, '→', bestSeparation);
  }

  return bestSeparation;
}

// Sépare intelligemment les mots en majuscules
export function separateUppercaseWords(text: string): string {
  const words = text.split(/\s+/);
  const result = words.map(word => {
    // Cas spécial: si on détecte un prénom connu
    const prénomMatch = word.match(/^([A-ZÀ-Ű][a-zà-ÿ]+)([A-ZÀ-Ű].+)$/);
    if (prénomMatch && isKnownFirstName(prénomMatch[1])) {
      return `${prénomMatch[1]} ${prénomMatch[2]}`;
    }

    // Pour les mots tout en majuscules
    if (/^[A-ZÀ-Ű]+$/.test(word)) {
      return separateUppercaseWord(word);
    }

    return word;
  });

  return result.join(' ');
}

// Vérifie si un mot doit être conservé
export function shouldKeepWord(word: string): boolean {
  // Garde les nombres et la ponctuation associée
  if (/\d/.test(word)) return true;
  
  // Garde les mots avec des accents
  if (/[À-ÿ]/.test(word)) return true;
  
  // Garde les mots commençant par une majuscule (noms propres)
  if (/^[A-ZÀ-Ű]/.test(word)) return true;
  
  // Garde les mots connus
  if (isKnownWord(word.toLowerCase())) return true;
  
  // Garde les mots de plus de 2 caractères
  if (word.length > 2) return true;
  
  return false;
}