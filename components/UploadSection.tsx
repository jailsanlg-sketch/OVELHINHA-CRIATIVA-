
import React from 'react';

interface UploadSectionProps {
  onImageSelect: (image: string) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onImageSelect }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:border-indigo-300 transition-colors cursor-pointer group relative overflow-hidden">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-800">Selecione a foto do produto</h2>
      <p className="text-slate-500 mt-2 max-w-sm">Use uma foto clara da sua lembrancinha ou produto. Nós cuidamos do design.</p>
      <div className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium shadow-md shadow-indigo-100">
        Escolher Arquivo
      </div>
    </div>
  );
};

export default UploadSection;
