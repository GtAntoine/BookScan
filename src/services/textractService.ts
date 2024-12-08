import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

interface TextBlock {
  Geometry?: {
    BoundingBox?: {
      Width?: number;
      Height?: number;
      Left?: number;
      Top?: number;
    };
  };
  Text?: string;
}

const textractClient = new TextractClient({
  region: "eu-west-3",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  }
});

function detectOrientation(blocks: TextBlock[]): 'horizontal' | 'vertical' | undefined {
  if (blocks.length < 2) return undefined;

  let horizontalCount = 0;
  let verticalCount = 0;

  for (let i = 0; i < blocks.length - 1; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const block1 = blocks[i];
      const block2 = blocks[j];

      if (!block1.Geometry?.BoundingBox || !block2.Geometry?.BoundingBox) continue;

      const box1 = block1.Geometry.BoundingBox;
      const box2 = block2.Geometry.BoundingBox;

      // Vérifie si les blocs sont alignés horizontalement (tolérance de 2%)
      if (Math.abs((box1.Top || 0) - (box2.Top || 0)) < 0.05) {
        horizontalCount++;
      }
      // Vérifie si les blocs sont alignés verticalement (tolérance de 2%)
      else if (Math.abs((box1.Left || 0) - (box2.Left || 0)) < 0.05) {
        verticalCount++;
      }
    }
  }

  console.log('Alignements détectés:', { horizontalCount, verticalCount });
  return horizontalCount > verticalCount ? 'horizontal' : 'vertical';
}

function shouldMergeBlocks(block1: TextBlock, block2: TextBlock, orientation: 'horizontal' | 'vertical'): boolean {
  if (!block1.Geometry?.BoundingBox || !block2.Geometry?.BoundingBox) return false;

  const box1 = block1.Geometry.BoundingBox;
  const box2 = block2.Geometry.BoundingBox;

  if (orientation === 'horizontal') {
    // Pour le texte horizontal : strict sur la verticale (2%), très tolérant sur l'horizontale (95%)
    const verticalAlignment = Math.abs((box1.Top || 0) - (box2.Top || 0)) < 0.05;
    const horizontalDistance = Math.abs(((box1.Left || 0) + (box1.Width || 0)) - (box2.Left || 0));
    const horizontalProximity = horizontalDistance < 0.95;
    
    // Vérifie si les blocs sont sur la même ligne horizontale
    return verticalAlignment && horizontalProximity;
  } else {
    // Pour le texte vertical : strict sur l'horizontale (2%), très tolérant sur la verticale (95%)
    const horizontalAlignment = Math.abs((box1.Left || 0) - (box2.Left || 0)) < 0.05;
    const verticalDistance = Math.abs(((box1.Top || 0) + (box1.Height || 0)) - (box2.Top || 0));
    const verticalProximity = verticalDistance < 0.95;
    
    // Vérifie si les blocs sont sur la même ligne verticale
    return horizontalAlignment && verticalProximity;
  }
}

function mergeBlocks(blocks: TextBlock[], orientation: 'horizontal' | 'vertical'): string[] {
  const lines: string[] = [];
  const usedBlocks = new Set<number>();

  // Trie les blocs par position
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (!a.Geometry?.BoundingBox || !b.Geometry?.BoundingBox) return 0;
    
    if (orientation === 'horizontal') {
      // Pour le texte horizontal, trie d'abord par position verticale puis horizontale
      const verticalDiff = (a.Geometry.BoundingBox.Top || 0) - (b.Geometry.BoundingBox.Top || 0);
      if (Math.abs(verticalDiff) < 0.03) {
        return (a.Geometry.BoundingBox.Left || 0) - (b.Geometry.BoundingBox.Left || 0);
      }
      return verticalDiff;
    } else {
      // Pour le texte vertical, trie d'abord par position horizontale puis verticale
      const horizontalDiff = (a.Geometry.BoundingBox.Left || 0) - (b.Geometry.BoundingBox.Left || 0);
      if (Math.abs(horizontalDiff) < 0.03) {
        // Pour le texte vertical, on inverse l'ordre pour avoir le texte dans le bon sens
        return (b.Geometry.BoundingBox.Top || 0) - (a.Geometry.BoundingBox.Top || 0);
      }
      return horizontalDiff;
    }
  });

  // Fusionne les blocs en lignes
  let currentLine: string[] = [];
  let currentTop: number | undefined;
  let currentLeft: number | undefined;

  for (let i = 0; i < sortedBlocks.length; i++) {
    if (usedBlocks.has(i)) continue;

    const block = sortedBlocks[i];
    if (!block.Text || !block.Geometry?.BoundingBox) continue;

    const box = block.Geometry.BoundingBox;

    // Si c'est le premier bloc d'une nouvelle ligne
    if (currentLine.length === 0) {
      currentLine = [block.Text];
      currentTop = box.Top;
      currentLeft = box.Left;
      usedBlocks.add(i);
      continue;
    }

    // Vérifie si le bloc appartient à la ligne courante
    if (shouldMergeBlocks(
      { Geometry: { BoundingBox: { Top: currentTop, Left: currentLeft } } },
      block,
      orientation
    )) {
      currentLine.push(block.Text);
      usedBlocks.add(i);
    } else {
      // Nouvelle ligne détectée
      if (currentLine.length > 0) {
        const line = currentLine.join(' ').trim();
        if (line.length > 3 && !/^\d+$/.test(line)) {
          lines.push(line);
        }
      }
      currentLine = [block.Text];
      currentTop = box.Top;
      currentLeft = box.Left;
      usedBlocks.add(i);
    }
  }

  // Ajoute la dernière ligne
  if (currentLine.length > 0) {
    const line = currentLine.join(' ').trim();
    if (line.length > 3 && !/^\d+$/.test(line)) {
      lines.push(line);
    }
  }

  return lines;
}

export async function detectText(imageBytes: ArrayBuffer): Promise<string> {
  try {
    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: new Uint8Array(imageBytes)
      }
    });

    const response = await textractClient.send(command);
    console.log('Réponse Textract:', response);

    if (!response.Blocks || response.Blocks.length === 0) {
      throw new Error('Aucun texte détecté');
    }

    // Filtre les blocs de type WORD uniquement
    const wordBlocks = response.Blocks.filter(
      block => block.BlockType === 'WORD'
    ) as TextBlock[];

    // Détecte l'orientation du texte
    const orientation = detectOrientation(wordBlocks);
    console.log('Orientation détectée:', orientation);

    if (!orientation) {
      throw new Error('Impossible de déterminer l\'orientation du texte');
    }

    // Fusionne les blocs en lignes
    const lines = mergeBlocks(wordBlocks, orientation);
    console.log('Texte détecté par Textract:', lines.join('\n'));

    return lines.join('\n');
  } catch (error) {
    console.error('Erreur Textract:', error);
    throw error;
  }
}