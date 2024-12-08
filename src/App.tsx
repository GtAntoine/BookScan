import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainApp } from './pages/MainApp';
import { BookOpen } from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-library-paper">
        <header className="header-wood shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-library-paper p-2 rounded-lg shadow-inner">
                  <BookOpen className="w-8 h-8 text-library-dark" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-library-paper">Multi Scan</h1>
                  <p className="text-library-light text-sm">Votre assistant bibliothèque personnel</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="*" element={<MainApp />} />
        </Routes>

        <footer className="header-wood text-library-light py-4 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm">
            <p>Scannez vos livres facilement • Organisez votre parcours de lecture • Partagez votre passion</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}