import { PUBLISHERS, LIAISON_WORDS } from './constants';
import { isKnownWord } from './wordValidation';
import { processCompoundWords } from './wordComposition';

// Nettoie et normalise le texte en préservant les accents et la ponctuation importante
export function normalizeText(text: string): string {
  const normalized = text
    .replace(/[^a-zA-ZÀ-ÿ0-9\s,.'()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log('Après normalisation:', normalized);
  return normalized;
}

// Supprime les préfixes d'éditeurs
export function removePublishers(text: string): string {
  // Vérifie au début et à la fin de la ligne
  const publisherPattern = new RegExp(`^(${PUBLISHERS.join('|')})\\s+|\\s+(${PUBLISHERS.join('|')})$`, 'i');
  const cleaned = text.replace(publisherPattern, '');
  
  if (cleaned !== text) {
    console.log('Éditeur supprimé:', text, '→', cleaned);
  }
  return cleaned;
}

// Supprime les nombres de 4 ou 5 chiffres en début ou fin de ligne
export function removeLineNumbers(text: string): string {
  // Supprime les nombres de 4-5 chiffres au début de la ligne
  let cleaned = text.replace(/^\d{4,5}\s+/, '');
  // Supprime les nombres de 4-5 chiffres à la fin de la ligne
  cleaned = cleaned.replace(/\s+\d{4,5}$/, '');
  
  if (cleaned !== text) {
    console.log('Nombres supprimés:', text, '→', cleaned);
  }
  return cleaned;
}

// Supprime les caractères parasites tout en préservant le contenu important
export function removeParasites(text: string): string {
  let cleaned = text;
  
  // Supprime les caractères spéciaux au début
  cleaned = cleaned.replace(/^[^a-zA-ZÀ-ÿ0-9\s]+/, '');
  
  // Supprime les caractères spéciaux indésirables
  cleaned = cleaned
    .replace(/[|Ï\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/[&@|]/g, '')
    // Supprime uniquement les codes connus à la fin
    .replace(/\s+(?:QOTIE|ISBN|SE)(?:\s|$)/g, '')
    .trim();

  // Supprime les caractères parasites à la fin sauf s'ils font partie d'un nombre
  cleaned = cleaned.replace(/(?<!\d)\s+[^a-zA-ZÀ-ÿ0-9\s]{1,3}(?:\s|$)/g, '').trim();

  if (cleaned !== text) {
    console.log('Nettoyage des parasites:', text, '→', cleaned);
  }
  
  return cleaned;
}

// Filtre les mots invalides tout en préservant la structure
function filterInvalidWords(text: string): string {
  const words = text.split(/\s+/);
  const validWords = words.filter(word => {
    // Garde toujours les nombres et la ponctuation associée
    if (/\d/.test(word)) return true;
    
    // Garde les mots avec des majuscules (noms propres potentiels)
    if (/[A-ZÀ-Ű]/.test(word)) return true;
    
    // Garde les mots de liaison connus
    if (LIAISON_WORDS.includes(word.toLowerCase())) return true;
    
    // Pour les autres mots courts, vérifie s'ils sont connus
    if (word.length <= 3) {
      const isValid = isKnownWord(word.toLowerCase());
      if (!isValid) {
        console.log('Mot court inconnu filtré:', word);
      }
      return isValid;
    }
    
    // Garde les mots plus longs par défaut
    return true;
  });
  
  return validWords.join(' ');
}

// Nettoie une ligne complète de manière intelligente
export function cleanLine(text: string): string {
  console.log('\nTraitement de la ligne:', text);
  
  // Normalise d'abord le texte
  let cleaned = normalizeText(text);
  console.log('Après normalisation:', cleaned);
  
  // Supprime les préfixes et suffixes d'éditeurs
  cleaned = removePublishers(cleaned);
  console.log('Après suppression éditeurs:', cleaned);
  
  // Supprime les nombres de 4-5 chiffres
  cleaned = removeLineNumbers(cleaned);
  console.log('Après suppression des nombres:', cleaned);
  
  // Supprime les caractères parasites
  cleaned = removeParasites(cleaned);
  
  console.log('Résultat final:', cleaned);
  return cleaned;
}