import React, { useRef, useEffect, useState } from 'react';
import Quagga from 'quagga';
import { Loader2, Barcode, Camera } from 'lucide-react';
import { searchBook } from '../services/bookSearch';
import { Book } from '../types/Book';

interface BarcodeScannerProps {
  onBookFound: (book: Book) => void;
}

export function BarcodeScanner({ onBookFound }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  const requestCameraPermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La fonctionnalité de caméra n\'est pas disponible sur cet appareil');
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      
      if (cameras.length === 0) {
        throw new Error('Aucune caméra n\'a été détectée sur cet appareil');
      }

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      startScanner();
    } catch (err) {
      console.error('Erreur permission caméra:', err);
      const errorMessage = err instanceof Error ? err.message : 
        'Veuillez autoriser l\'accès à la caméra pour scanner les codes-barres';
      setError(errorMessage);
      setHasPermission(false);
    }
  };

  const startScanner = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      setError('');

      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            facingMode: { ideal: "environment" },
            aspectRatio: { min: 1, max: 2 },
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 }
          },
          area: {
            top: "0%",    
            right: "0%",  
            left: "0%",   
            bottom: "0%" 
          },
        },
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "isbn_reader",
            "isbn_10_reader",
            "isbn_13_reader"
          ],
          multiple: false,
          debug: {
            drawBoundingBox: true,
            showPattern: true
          }
        },
        locate: true
      }, (err) => {
        if (err) {
          console.error('Erreur Quagga:', err);
          setError('Impossible d\'initialiser le scanner de codes-barres');
          setIsScanning(false);
          return;
        }
        
        console.log('Scanner démarré');
        Quagga.start();
      });

      Quagga.onDetected(async (result) => {
        const code = result.codeResult.code;
        if (code) {
          console.log('Code-barres détecté:', code);
          
          stopScanner();
          
          try {
            const book = await searchBook(code);
            if (book) {
              onBookFound(book);
            } else {
              setError('Livre non trouvé avec ce code-barres');
            }
          } catch (err) {
            console.error(err);
            setError('Erreur lors de la recherche du livre');
          }
        }
      });

    } catch (err) {
      console.error('Erreur scanner:', err);
      setError('Erreur lors de l\'initialisation du scanner');
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (isScanning) {
      Quagga.stop();
      setIsScanning(false);
    }
  };

  const handleScanClick = () => {
    if (isScanning) {
      stopScanner();
    } else if (hasPermission === true) {
      startScanner();
    } else {
      requestCameraPermission();
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="w-full">
      <button
        onClick={handleScanClick}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        {hasPermission === false ? (
          <Camera size={20} />
        ) : (
          <Barcode size={20} />
        )}
        {isScanning ? 'Arrêter le scan' : hasPermission === false ? 'Autoriser la caméra' : 'Scanner un code-barres'}
      </button>

      {isScanning && (
        <div className="mt-4">
          <div 
            ref={videoRef} 
            className="w-full h-[480px] max-w-3xl mx-auto rounded-lg overflow-hidden bg-gray-900 relative"
          >
            <div className="absolute inset-0 border-2 border-blue-500 opacity-50 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-500"></div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p>Centrez le code-barres dans le cadre...</p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-center mt-4">{error}</p>
      )}
    </div>
  );
}