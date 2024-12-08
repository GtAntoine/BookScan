import React, { useRef, useState } from 'react';
import { Camera as CameraIcon, Upload, RotateCw } from 'lucide-react';
import { detectText } from '../services/textractService';

interface CameraProps {
  onTextExtracted: (text: string) => void;
  onProcessing: (processing: boolean) => void;
}

export function Camera({ onTextExtracted, onProcessing }: CameraProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<string>('');

  const preprocessImage = async (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("Échec de la lecture du fichier"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  const processImage = async (file: File) => {
    try {
      onProcessing(true);
      setError('');
      setProgress('Préparation de l\'image...');

      const imageBuffer = await preprocessImage(file);
      
      setProgress('Analyse du texte...');
      const detectedText = await detectText(imageBuffer);

      if (!detectedText) {
        throw new Error('Aucun texte détecté dans l\'image');
      }

      onTextExtracted(detectedText);
    } catch (err) {
      console.error('Erreur lors de l\'analyse:', err);
      setError('Erreur lors de l\'analyse de l\'image');
    } finally {
      onProcessing(false);
      setProgress('');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center mb-8">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="btn-primary group"
        >
          <CameraIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
          Prendre une photo
        </button>
        
        <button
          onClick={() => galleryInputRef.current?.click()}
          className="btn-secondary group"
        >
          <Upload className="w-5 h-5 transition-transform group-hover:scale-110" />
          Importer une image
        </button>
      </div>

      {progress && (
        <div className="flex items-center justify-center gap-2 text-library-wood animate-fade-in">
          <RotateCw className="w-5 h-5 animate-spin" />
          <p className="font-medium">{progress}</p>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-center mt-4 animate-fade-in">{error}</p>
      )}
    </div>
  );
}