
import React, { useState, useEffect } from 'react';

interface LoadingOverlayProps {
  isVideo?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVideo }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  
  const imgMessages = [
    "Analisando sua lembrancinha...",
    "Aplicando o estilo da Ovelhinha Criativa...",
    "Criando tipografia de luxo...",
    "Finalizando sua peça..."
  ];

  const videoMessages = [
    "Iniciando motores de animação...",
    "Dando vida ao seu produto...",
    "Adicionando efeitos cinematográficos...",
    "Renderizando vídeo em alta qualidade...",
    "Quase pronto, a espera vale a pena!"
  ];

  const messages = isVideo ? videoMessages : imgMessages;

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [messages]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-12 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
          <div className={`absolute inset-0 border-4 ${isVideo ? 'border-amber-500' : 'border-indigo-600'} rounded-full border-t-transparent animate-spin`} />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            {isVideo ? '🎬' : '🎨'}
          </div>
        </div>
        <h3 className="text-2xl font-serif text-slate-900 mb-2">
          {isVideo ? 'Criando Animação' : 'Criando Arte'}
        </h3>
        <p className="text-slate-500 font-medium h-6">{messages[messageIndex]}</p>
        <div className="mt-8 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className={`h-full ${isVideo ? 'bg-amber-500' : 'bg-indigo-600'} animate-[loading_15s_ease-in-out_infinite]`} style={{width: '30%'}} />
        </div>
        <p className="mt-6 text-slate-300 text-xs">
          {isVideo ? 'A geração de vídeo leva cerca de 30-60 segundos.' : 'Usando Gemini 2.5 Flash para máxima qualidade.'}
        </p>
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 5%; }
          50% { width: 70%; }
          100% { width: 95%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
