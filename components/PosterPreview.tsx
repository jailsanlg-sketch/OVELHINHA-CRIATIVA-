
import React from 'react';
import { GeneratedPoster } from '../types';

interface PosterPreviewProps {
  poster: GeneratedPoster;
  onReset: () => void;
  onBackToConfig: () => void;
  onRegenerate: () => void;
  onAnimate: () => void;
  onSave: () => void;
  isAnimating: boolean;
  isSaved: boolean;
}

export const PosterPreview: React.FC<PosterPreviewProps> = ({ 
  poster, onReset, onBackToConfig, onRegenerate, onAnimate, onSave, isAnimating, isSaved 
}) => {
  const downloadFile = (url: string, isVideo: boolean) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `ovelhinha-${Date.now()}${isVideo ? '.mp4' : '.png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full animate-in zoom-in-95 duration-700">
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center">
        <h2 className="text-2xl font-serif text-slate-900 mb-6 text-center">
          Sua Arte Exclusiva ✨
        </h2>
        
        <div className="relative group max-w-lg w-full bg-slate-50 rounded-2xl overflow-hidden shadow-inner">
          {poster.videoUrl ? (
            <video src={poster.videoUrl} autoPlay loop muted playsInline className="w-full h-auto rounded-lg shadow-lg" />
          ) : (
            <img src={poster.url} alt="Resultado" className="w-full h-auto rounded-lg shadow-lg" />
          )}
          
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              disabled={isSaved}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all font-semibold text-sm ${
                isSaved 
                ? 'bg-pink-500 text-white scale-105 cursor-default' 
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-pink-500 active:scale-95'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              {isSaved ? 'Salvo na Galeria' : 'Adicionar à Galeria'}
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
          <button 
            onClick={() => downloadFile(poster.videoUrl || poster.url, !!poster.videoUrl)}
            className="py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            Baixar {poster.videoUrl ? 'Vídeo' : 'Imagem'}
          </button>
          
          {!poster.videoUrl && (
            <button 
              onClick={onAnimate}
              disabled={isAnimating}
              className="py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              Transformar em Vídeo (VEO)
            </button>
          )}

          <button onClick={onBackToConfig} className="py-4 bg-indigo-50 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-100 transition-all">
            Voltar aos Ajustes
          </button>

          <button onClick={onRegenerate} className="py-4 bg-white text-slate-600 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all">
            Tentar Outra Arte
          </button>
          
          <button onClick={onReset} className="sm:col-span-2 py-3 text-slate-400 hover:text-slate-600 text-sm">
            Fazer Novo Upload
          </button>
        </div>
      </div>
    </div>
  );
};
