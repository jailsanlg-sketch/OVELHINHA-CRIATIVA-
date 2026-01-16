
import React from 'react';
import { SavedItem } from '../types';

interface GalleryProps {
  items: SavedItem[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ items, onRemove, onClose }) => {
  const downloadFile = (url: string, isVideo: boolean) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `ovelhinha-salva-${Date.now()}${isVideo ? '.mp4' : '.png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-serif text-slate-900">Minha Galeria</h2>
          <p className="text-slate-500">Suas criações salvas com sucesso.</p>
        </div>
        <button onClick={onClose} className="text-indigo-600 font-semibold hover:underline bg-indigo-50 px-4 py-2 rounded-full">Voltar ao Criador</button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-xl">
          <div className="text-5xl mb-4 text-slate-200">💎</div>
          <h3 className="text-xl font-semibold text-slate-800">Sua galeria está vazia</h3>
          <p className="text-slate-400 mt-2">Crie artes incríveis e adicione-as aqui.</p>
          <button onClick={onClose} className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-full font-medium shadow-lg hover:bg-indigo-700 transition-all">Começar a Criar</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-100 group flex flex-col">
              <div className="relative aspect-square bg-slate-50">
                {item.videoUrl ? (
                  <video src={item.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} alt="Salva" className="w-full h-full object-cover" />
                )}
                
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    onClick={() => downloadFile(item.videoUrl || item.url, !!item.videoUrl)}
                    className="p-3 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform shadow-lg"
                    title="Baixar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                    title="Excluir"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4 flex-grow border-t border-slate-50">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    {new Date(item.timestamp).toLocaleDateString('pt-BR')}
                  </p>
                  {item.videoUrl && <span className="bg-amber-100 text-amber-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">VÍDEO</span>}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 font-medium leading-relaxed">
                  {item.prompt.split('Estilo: ')[1]?.split('.')[0] || 'Design Ovelhinha'}
                </p>
              </div>
              <div className="flex sm:hidden border-t border-slate-50 p-2 gap-2 bg-slate-50/50">
                <button onClick={() => downloadFile(item.videoUrl || item.url, !!item.videoUrl)} className="flex-1 py-2 text-xs font-bold text-slate-700 bg-white rounded-lg shadow-sm border border-slate-200">Baixar</button>
                <button onClick={() => onRemove(item.id)} className="flex-1 py-2 text-xs font-bold text-red-600 bg-white rounded-lg shadow-sm border border-slate-200">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
