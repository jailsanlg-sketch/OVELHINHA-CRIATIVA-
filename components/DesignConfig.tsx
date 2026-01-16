
import React from 'react';
import { PosterConfig } from '../types';

interface DesignConfigProps {
  config: PosterConfig;
  setConfig: React.Dispatch<React.SetStateAction<PosterConfig>>;
}

const DesignConfig: React.FC<DesignConfigProps> = ({ config, setConfig }) => {
  const styles = [
    { id: 'Minimalista e Luxuoso', icon: '✨', desc: 'Clean, fontes finas e cores neutras.' },
    { id: 'Colorido e Vibrante', icon: '🌈', desc: 'Energia alta, contrastes e alegria.' },
    { id: 'Vintage e Rústico', icon: '📜', desc: 'Texturas orgânicas e tons terrosos.' },
    { id: 'Moderno e High-Tech', icon: '🚀', desc: 'Neon, gradientes e fontes futuristas.' },
    { id: 'Aquarela Delicada', icon: '🎨', desc: 'Suavidade, artesanal e romântico.' }
  ];

  const formats = [
    { id: '1:1', label: 'Quadrado (Instagram)' },
    { id: '9:16', label: 'Vertical (Stories)' },
    { id: '4:3', label: 'Paisagem (Web)' }
  ] as const;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 block uppercase tracking-wide">Estilo do Design</label>
        <div className="grid grid-cols-1 gap-3">
          {styles.map(style => (
            <button
              key={style.id}
              onClick={() => setConfig(prev => ({ ...prev, style: style.id }))}
              className={`flex items-center gap-4 text-left px-4 py-3 rounded-xl border transition-all ${
                config.style === style.id 
                ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-md ring-1 ring-indigo-500' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <span className="text-2xl">{style.icon}</span>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{style.id}</span>
                <span className="text-[10px] opacity-70 leading-tight">{style.desc}</span>
              </div>
              {config.style === style.id && (
                <div className="ml-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 block uppercase tracking-wide">Formato</label>
          <div className="flex gap-2">
            {formats.map(f => (
              <button
                key={f.id}
                onClick={() => setConfig(prev => ({ ...prev, format: f.id }))}
                className={`flex-1 py-2 px-1 text-[10px] font-bold rounded-lg border transition-all ${
                  config.format === f.id 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 block uppercase tracking-wide">Toque Especial</label>
          <textarea 
            placeholder="Ex: Fundo com pétalas de rosas, estilo romântico..."
            value={config.extraPrompt}
            onChange={(e) => setConfig(prev => ({ ...prev, extraPrompt: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};

export default DesignConfig;
