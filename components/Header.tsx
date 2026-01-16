
import React from 'react';

interface HeaderProps {
  onToggleGallery: () => void;
  galleryCount: number;
  isGalleryOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleGallery, galleryCount, isGalleryOpen }) => {
  return (
    <header className="w-full py-6 bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-serif text-slate-900 tracking-tight">Ovelhinha<span className="text-indigo-600">Criativa</span></h1>
          <p className="text-xs text-slate-400 font-light hidden sm:block">Design inteligente para lembrancinhas.</p>
        </div>
        
        <button 
          onClick={onToggleGallery}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${
            isGalleryOpen 
            ? 'bg-indigo-600 text-white border-indigo-600' 
            : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          <span className="font-semibold text-sm">Minha Galeria</span>
          {galleryCount > 0 && (
            <span className={`flex items-center justify-center w-5 h-5 text-[10px] rounded-full ${isGalleryOpen ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'}`}>
              {galleryCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
