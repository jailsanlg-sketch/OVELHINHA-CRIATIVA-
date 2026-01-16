
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
    const saved = localStorage.getItem('ovelhinha_gallery_v3');
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
      localStorage.setItem('ovelhinha_gallery_v3', JSON.stringify(gallery));
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
      const prompt = `Crie um design de poster profissional para "Ovelhinha Criativa" usando este produto. Estilo: ${config.style}. ${config.extraPrompt}. Insira o nome "Ovelhinha Criativa" de forma elegante.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: image.split(',')[1], mimeType: 'image/png' } },
            { text: prompt },
          ],
        },
        config: { imageConfig: { aspectRatio: config.format as any } },
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setResult({ url: `data:image/png;base64,${part.inlineData.data}`, prompt });
        setStatus(AppStatus.SUCCESS);
      } else {
        throw new Error("Falha ao gerar imagem.");
      }
    } catch (err: any) {
      setError(err.message || "Erro de conexão.");
      setStatus(AppStatus.ERROR);
    }
  }, [image, config]);

  const generateGif = useCallback(async () => {
    if (!result?.url) return;
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) await (window as any).aistudio.openSelectKey();
    setStatus(AppStatus.ANIMATING);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Animação luxuosa deste design no estilo ${config.style}.`,
        image: { imageBytes: result.url.split(',')[1], mimeType: 'image/png' },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: config.format === '4:3' ? '16:9' : (config.format === '1:1' ? '16:9' : config.format as any) }
      });
      while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      setResult(prev => prev ? { ...prev, videoUrl: URL.createObjectURL(blob) } : null);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "Erro na animação.");
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
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <img src={image} alt="Original" className="w-full aspect-square object-contain bg-slate-50 rounded-xl" />
                    <button onClick={() => setImage(null)} className="text-xs text-indigo-600">Trocar Foto</button>
                  </div>
                  <DesignConfig config={config} setConfig={setConfig} />
                </div>
                <button onClick={generatePoster} className="mt-8 w-full py-4 bg-slate-900 text-white rounded-xl font-bold">Gerar Design</button>
              </div>
            )}
            {(status === AppStatus.SUCCESS || status === AppStatus.ANIMATING) && result && (
              <PosterPreview 
                poster={result} 
                onReset={() => { setImage(null); setResult(null); setStatus(AppStatus.IDLE); }}
                onBackToConfig={() => setStatus(AppStatus.IDLE)}
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
    </div>
  );
};

export default App;
