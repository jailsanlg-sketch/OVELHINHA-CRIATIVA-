
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AppStatus, PosterConfig, GeneratedPoster, SavedItem } from './types';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import DesignConfig from './components/DesignConfig';
import { PosterPreview } from './components/PosterPreview';
import LoadingOverlay from './components/LoadingOverlay';
import Gallery from './components/Gallery';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [gallery, setGallery] = useState<SavedItem[]>([]);
  const [config, setConfig] = useState<PosterConfig>({
    format: '1:1',
    style: 'Minimalista e Luxuoso',
    extraPrompt: ''
  });
  const [result, setResult] = useState<GeneratedPoster | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ovelhinha_gallery_v4');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setGallery(parsed);
      } catch (e) {
        console.error("Erro ao carregar galeria", e);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ovelhinha_gallery_v4', JSON.stringify(gallery));
    } catch (e) {
      setError("A galeria está cheia. Remova itens antigos para salvar novos.");
    }
  }, [gallery]);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const generatePoster = useCallback(async () => {
    if (!image) return;
    setStatus(AppStatus.LOADING);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Detecção dinâmica do tipo MIME para suportar JPEG, PNG, etc.
      const mimeTypeMatch = image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
      const base64Data = image.split(',')[1];

      const prompt = `Atue como um designer gráfico de elite. Crie um PÔSTER PROFISSIONAL DE ALTA QUALIDADE para o produto na imagem.
      
ESTILO SOLICITADO: ${config.style}.
TOQUE EXTRA: ${config.extraPrompt || 'Nenhum'}.

INSTRUÇÕES DE DESIGN:
1. Remova ou integre harmoniosamente o fundo original para criar uma cena de estúdio ou ambiente sofisticado que valorize a lembrancinha.
2. Adicione o texto "Ovelhinha Criativa" com uma tipografia elegante e moderna.
3. O design deve parecer um anúncio premium para Instagram ou catálogo de luxo.
4. Aplique iluminação profissional e sombras realistas para dar profundidade.
5. O resultado deve ser uma peça de design completa, com cores que harmonizem com o produto original.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: prompt },
          ],
        },
        config: { 
          imageConfig: { 
            aspectRatio: config.format as any 
          } 
        },
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setResult({ url: `data:image/png;base64,${part.inlineData.data}`, prompt });
        setStatus(AppStatus.SUCCESS);
      } else {
        const textPart = response.candidates?.[0]?.content?.parts.find(p => p.text);
        throw new Error(textPart?.text || "Não foi possível gerar o design. Tente uma foto mais nítida.");
      }
    } catch (err: any) {
      console.error("Erro na geração:", err);
      let msg = "Erro inesperado. Verifique sua conexão ou tente outra foto.";
      if (err.message?.includes("API key")) msg = "Erro de autenticação. A chave API parece inválida.";
      else if (err.message?.includes("safety")) msg = "A imagem foi bloqueada pelos filtros de segurança. Tente uma foto diferente.";
      else if (err.message) msg = err.message;
      
      setError(msg);
      setStatus(AppStatus.ERROR);
    }
  }, [image, config]);

  const generateGif = useCallback(async () => {
    if (!result?.url) return;
    
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
    
    setStatus(AppStatus.ANIMATING);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Uma animação cinematográfica e luxuosa deste design. Estilo ${config.style}. Movimentos de câmera suaves e brilhos dinâmicos.`,
        image: { imageBytes: result.url.split(',')[1], mimeType: 'image/png' },
        config: { 
          numberOfVideos: 1, 
          resolution: '720p', 
          aspectRatio: config.format === '4:3' ? '16:9' : (config.format === '1:1' ? '16:9' : config.format as any) 
        }
      });
      
      while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }
      
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) throw new Error("Erro ao baixar vídeo.");
      
      const blob = await response.blob();
      setResult(prev => prev ? { ...prev, videoUrl: URL.createObjectURL(blob) } : null);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error("Erro Veo:", err);
      setError("Erro ao animar vídeo: " + (err.message || "Tente novamente."));
      setStatus(AppStatus.SUCCESS); 
    }
  }, [result, config]);

  const saveToGallery = useCallback(async () => {
    if (!result) return;
    if (gallery.some(item => item.url === result.url)) return;
    try {
      const optimizedUrl = await compressImage(result.url);
      const newItem: SavedItem = {
        ...result,
        url: optimizedUrl,
        id: `item-${Date.now()}`,
        timestamp: Date.now()
      };
      setGallery(prev => [newItem, ...prev]);
    } catch (e) { console.error(e); }
  }, [result, gallery]);

  return (
    <div className="min-h-screen flex flex-col items-center pb-12">
      <Header onToggleGallery={() => setShowGallery(!showGallery)} galleryCount={gallery.length} isGalleryOpen={showGallery} />
      <main className="w-full max-w-4xl px-4 mt-8">
        {showGallery ? (
          <Gallery items={gallery} onRemove={id => setGallery(g => g.filter(i => i.id !== id))} onClose={() => setShowGallery(false)} />
        ) : (
          <>
            {!image && <UploadSection onImageSelect={setImage} />}
            
            {image && status !== AppStatus.SUCCESS && status !== AppStatus.ANIMATING && (
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="relative group overflow-hidden rounded-xl border border-slate-100">
                      <img src={image} alt="Original" className="w-full aspect-square object-contain bg-slate-50" />
                      <button 
                        onClick={() => { setImage(null); setError(null); }} 
                        className="absolute top-2 right-2 bg-white/90 text-slate-700 p-2 rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Trocar Foto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">Foto Original</p>
                  </div>
                  <DesignConfig config={config} setConfig={setConfig} />
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-in shake duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex flex-col">
                      <span className="font-bold">Houve um problema:</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <button 
                  onClick={generatePoster} 
                  disabled={status === AppStatus.LOADING}
                  className="mt-8 w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                >
                  {status === AppStatus.LOADING ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Criando Design...
                    </>
                  ) : 'Gerar Design Exclusivo ✨'}
                </button>
              </div>
            )}
            
            {(status === AppStatus.SUCCESS || status === AppStatus.ANIMATING) && result && (
              <PosterPreview 
                poster={result} 
                onReset={() => { setImage(null); setResult(null); setStatus(AppStatus.IDLE); setError(null); }}
                onBackToConfig={() => { setStatus(AppStatus.IDLE); setError(null); }}
                onRegenerate={generatePoster}
                onAnimate={generateGif}
                onSave={saveToGallery}
                isAnimating={status === AppStatus.ANIMATING}
                isSaved={gallery.some(item => item.url === result.url)}
              />
            )}
          </>
        )}
      </main>
      {(status === AppStatus.LOADING || status === AppStatus.ANIMATING) && <LoadingOverlay isVideo={status === AppStatus.ANIMATING} />}
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};

export default App;
