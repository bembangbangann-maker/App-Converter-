import React, { useState } from 'react';
import { AppConfig, GenerationStatus } from '../types';
import { generateAppIcon, generateSplashScreen } from '../services/geminiService';
import { Sparkles, RefreshCw, Upload, Smartphone, Image as ImageIcon } from 'lucide-react';

interface AssetManagerProps {
  config: AppConfig;
  onIconChange: (url: string) => void;
  onSplashChange: (url: string) => void;
}

export const AssetManager: React.FC<AssetManagerProps> = ({ config, onIconChange, onSplashChange }) => {
  const [iconStatus, setIconStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [splashStatus, setSplashStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);

  const handleGenerateIcon = async () => {
    if (!config.name) return;
    setIconStatus(GenerationStatus.LOADING);
    try {
      const url = await generateAppIcon(config.name, config.description);
      onIconChange(url);
      setIconStatus(GenerationStatus.SUCCESS);
    } catch (e) {
      setIconStatus(GenerationStatus.ERROR);
    }
  };

  const handleGenerateSplash = async () => {
    if (!config.name) return;
    setSplashStatus(GenerationStatus.LOADING);
    try {
      const url = await generateSplashScreen(config.name, config.description);
      onSplashChange(url);
      setSplashStatus(GenerationStatus.SUCCESS);
    } catch (e) {
      setSplashStatus(GenerationStatus.ERROR);
    }
  };

  const handleFileUpload = (type: 'icon' | 'splash') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'icon') onIconChange(reader.result as string);
        else onSplashChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Icon Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300 flex items-center">
            <ImageIcon size={16} className="mr-2" /> App Icon (512x512)
        </label>
        <div className="flex items-center space-x-4">
            <div className="relative group w-20 h-20 rounded-2xl bg-card border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden transition-all hover:border-primary shrink-0">
            {config.iconUrl ? (
                <img src={config.iconUrl} alt="App Icon" className="w-full h-full object-cover" />
            ) : (
                <div className="text-gray-500 text-[10px] text-center px-1">No Icon</div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white">
                    <Upload size={14} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload('icon')} />
                </label>
            </div>
            </div>
            <button
                type="button"
                onClick={handleGenerateIcon}
                disabled={iconStatus === GenerationStatus.LOADING || !config.name}
                className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
            >
                 {iconStatus === GenerationStatus.LOADING ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                 <span>Generate Icon</span>
            </button>
        </div>
      </div>

      {/* Splash Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300 flex items-center">
            <Smartphone size={16} className="mr-2" /> Splash Screen (9:16)
        </label>
        <div className="flex items-center space-x-4">
            <div className="relative group w-20 h-36 rounded-lg bg-card border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden transition-all hover:border-primary shrink-0">
            {config.splashUrl ? (
                <img src={config.splashUrl} alt="Splash" className="w-full h-full object-cover" />
            ) : (
                <div className="text-gray-500 text-[10px] text-center px-1">No Image</div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white">
                    <Upload size={14} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload('splash')} />
                </label>
            </div>
            </div>
             <button
                type="button"
                onClick={handleGenerateSplash}
                disabled={splashStatus === GenerationStatus.LOADING || !config.name}
                className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
            >
                 {splashStatus === GenerationStatus.LOADING ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                 <span>Generate Splash</span>
            </button>
        </div>
      </div>

    </div>
  );
};