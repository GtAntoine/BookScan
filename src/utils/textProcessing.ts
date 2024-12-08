import { cleanLine } from './textCleaning';

// Vérifie si une ligne est trop courte ou ne ressemble pas à un titre de livre
function isValidBookLine(line: string): boolean {
  // Ignore les lignes trop courtes
  if (line.length < 10) return false;
  
  // Compte le nombre de mots significatifs (plus de 2 caractères)
  const words = line.split(/\s+/).filter(word => word.length > 2);
  if (words.length < 2) return false;
  
  // Vérifie qu'il y a au moins un mot commençant par une majuscule
  const hasCapitalizedWord = words.some(word => /^[A-ZÀ-Ű]/.test(word));
  if (!hasCapitalizedWord) return false;
  
  return true;
}

export function extractBookCandidates(text: string): string[] {
  // Sépare le texte en lignes
  const lines = text
    .split(/\n+/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  console.log('Lignes détectées:', lines);
  
  // Traite chaque ligne
  const candidates = lines
    .map(line => {
      console.log('\nAnalyse de la ligne:', line);
      
      // Nettoie la ligne
      const cleaned = cleanLine(line);
      console.log('Après nettoyage:', cleaned);
      
      // Vérifie si la ligne est valide
      if (!isValidBookLine(cleaned)) {
        console.log('Ligne ignorée car trop courte ou invalide');
        return null;
      }
      
      return cleaned;
    })
    .filter((line): line is string => 
      line !== null && 
      line.length > 0 &&
      // Ignore les lignes trop courtes qui sont probablement des artefacts
      !/^[A-Z]\s+[A-Z]\s+[A-Z]$/.test(line) && // Ignore les séquences de lettres isolées
      !/^\d+\s+\d+$/.test(line) && // Ignore les séquences de nombres
      !/^[A-Z]{1,3}\s+[A-Z]{1,3}$/.test(line) // Ignore les codes courts
    );

  // Supprime les doublons éventuels
  return [...new Set(candidates)];
}