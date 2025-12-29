import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { AppConfig, GeneratedFile } from './types';
import { generateFiles } from './services/generatorService';
import { enhanceDescription, generateReadme, generatePrivacyPolicy } from './services/geminiService';
import { AssetManager } from './components/IconGen';
import { PermissionSelector } from './components/PermissionSelector';
import { Layout, Globe, FileText, Download, Copy, Sparkles, Code2, Monitor, Play, Shield, Archive } from 'lucide-react';

const DefaultConfig: AppConfig = {
  name: '',
  url: 'https://',
  description: '',
  color: '#6366f1',
  iconUrl: '',
  splashUrl: '',
  permissions: {
    camera: false,
    microphone: false,
    geolocation: false,
    notifications: false,
    fullscreen: false
  }
};

export default function App() {
  const [config, setConfig] = useState<AppConfig>(DefaultConfig);
  const [activeTab, setActiveTab] = useState<string>('manifest.json');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [isGeneratingReadme, setIsGeneratingReadme] = useState(false);
  
  const [privacyPolicyContent, setPrivacyPolicyContent] = useState<string>('');
  const [isGeneratingPrivacy, setIsGeneratingPrivacy] = useState(false);

  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    // Regenerate files whenever config changes
    const files = generateFiles(config);
    setGeneratedFiles(files);
    
    // Auto-select tab if it doesn't exist anymore (rare case)
    if (!files.find(f => f.name === activeTab) && activeTab !== 'README.md' && activeTab !== 'PRIVACY.md') {
       if (files.length > 0) setActiveTab(files[0].name);
    }
  }, [config]);

  const handleEnhanceDescription = async () => {
    if (!config.name) return;
    setIsEnhancing(true);
    const newDesc = await enhanceDescription(config.description, config.name);
    setConfig(prev => ({ ...prev, description: newDesc }));
    setIsEnhancing(false);
  };

  const handleGenerateReadme = async () => {
      setIsGeneratingReadme(true);
      setActiveTab('README.md');
      const perms = Object.entries(config.permissions)
        .filter(([_, v]) => v)
        .map(([k]) => k);
      const content = await generateReadme(config.name || 'MyApp', perms);
      setReadmeContent(content);
      setIsGeneratingReadme(false);
  };

  const handleGeneratePrivacy = async () => {
      setIsGeneratingPrivacy(true);
      setActiveTab('PRIVACY.md');
      const perms = Object.entries(config.permissions)
        .filter(([_, v]) => v)
        .map(([k]) => k);
      const content = await generatePrivacyPolicy(config.name || 'MyApp', perms);
      setPrivacyPolicyContent(content);
      setIsGeneratingPrivacy(false);
  }

  const downloadFile = (file: GeneratedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    if (!config.name) return;
    setIsZipping(true);
    try {
        const zip = new JSZip();
        
        // Add generated text files
        generatedFiles.forEach(file => {
            zip.file(file.name, file.content);
        });

        // Add Readme if generated
        if (readmeContent) zip.file("README.md", readmeContent);
        
        // Add Privacy Policy if generated
        if (privacyPolicyContent) zip.file("PRIVACY.md", privacyPolicyContent);

        // Add Icon
        if (config.iconUrl) {
            const response = await fetch(config.iconUrl);
            const blob = await response.blob();
            zip.file("icon.png", blob);
        }

        // Add Splash
        if (config.splashUrl) {
            const response = await fetch(config.splashUrl);
            const blob = await response.blob();
            zip.file("splash.png", blob);
        }

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${config.name.replace(/\s+/g, '-')}-app-bundle.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Failed to zip", e);
    } finally {
        setIsZipping(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  let currentFileContent = '';
  if (activeTab === 'README.md') currentFileContent = readmeContent;
  else if (activeTab === 'PRIVACY.md') currentFileContent = privacyPolicyContent;
  else currentFileContent = generatedFiles.find(f => f.name === activeTab)?.content || '';

  return (
    <div className="min-h-screen bg-darker text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 bg-dark/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
                <Layout size={24} className="text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Appify AI
                </h1>
                <p className="text-xs text-gray-500">Web to Standalone Converter</p>
            </div>
          </div>
          <button 
            onClick={handleDownloadZip}
            disabled={!config.name || isZipping}
            className="hidden md:flex items-center space-x-2 bg-white text-darker px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
             {isZipping ? <Sparkles className="animate-spin" size={16}/> : <Archive size={16} />}
             <span>{isZipping ? "Bundling..." : "Download Full Bundle"}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
             <h2 className="text-lg font-semibold mb-6 flex items-center text-white">
                <Monitor className="mr-2 text-primary" size={20}/> 
                App Configuration
             </h2>

             <div className="space-y-5">
                {/* App Name & URL */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">App Name</label>
                        <input
                            type="text"
                            value={config.name}
                            onChange={(e) => setConfig({ ...config, name: e.target.value })}
                            placeholder="e.g. My Dashboard"
                            className="w-full bg-darker border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Web URL</label>
                        <div className="relative">
                            <Globe size={16} className="absolute left-3 top-3 text-gray-500" />
                            <input
                                type="url"
                                value={config.url}
                                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                                className="w-full bg-darker border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Description with AI */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <div className="relative">
                        <textarea
                            value={config.description}
                            onChange={(e) => setConfig({ ...config, description: e.target.value })}
                            rows={3}
                            className="w-full bg-darker border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                            placeholder="What does your app do?"
                        />
                        <button 
                            onClick={handleEnhanceDescription}
                            disabled={!config.name || isEnhancing}
                            className="absolute right-2 bottom-2 p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="Enhance with AI"
                        >
                            {isEnhancing ? <span className="animate-spin">✨</span> : <Sparkles size={16} />}
                        </button>
                    </div>
                </div>

                 <hr className="border-gray-800" />

                 {/* Permissions */}
                 <PermissionSelector 
                    permissions={config.permissions}
                    onChange={(key) => setConfig(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
                    }))}
                 />

                 <hr className="border-gray-800" />

                 {/* Assets Generator (Replaces IconGen) */}
                 <AssetManager 
                    config={config} 
                    onIconChange={(url) => setConfig({...config, iconUrl: url})} 
                    onSplashChange={(url) => setConfig({...config, splashUrl: url})}
                 />

                 {/* Theme Color */}
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Theme Color</label>
                    <div className="flex items-center space-x-3">
                        <input 
                            type="color" 
                            value={config.color}
                            onChange={(e) => setConfig({...config, color: e.target.value})}
                            className="h-10 w-14 bg-transparent cursor-pointer rounded overflow-hidden" 
                        />
                        <span className="text-sm font-mono text-gray-400">{config.color.toUpperCase()}</span>
                    </div>
                 </div>

             </div>
          </div>
        </div>

        {/* Right Column: Preview & Code */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold flex items-center text-white">
                    <Code2 className="mr-2 text-secondary" size={20} />
                    Generated Package
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={handleGeneratePrivacy}
                        disabled={isGeneratingPrivacy}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs font-medium transition-colors"
                    >
                         {isGeneratingPrivacy ? <Sparkles className="animate-spin" size={12}/> : <Shield size={12} />}
                        <span>Privacy Policy</span>
                    </button>
                    <button
                        onClick={handleGenerateReadme}
                        disabled={isGeneratingReadme}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs font-medium transition-colors"
                    >
                        {isGeneratingReadme ? "Thinking..." : "Instructions"}
                    </button>
                </div>
            </div>

            {/* Code Viewer */}
            <div className="flex-1 bg-card/50 border border-gray-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm flex flex-col min-h-[600px]">
                
                {/* Tabs */}
                <div className="flex border-b border-gray-800 overflow-x-auto scrollbar-hide">
                    {generatedFiles.map(file => (
                        <button
                            key={file.name}
                            onClick={() => setActiveTab(file.name)}
                            className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex items-center space-x-2 ${
                                activeTab === file.name 
                                    ? 'border-primary text-white bg-white/5' 
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                            }`}
                        >
                            <span>{file.name}</span>
                        </button>
                    ))}
                     <button
                        onClick={() => {
                            if (!privacyPolicyContent) handleGeneratePrivacy();
                            else setActiveTab('PRIVACY.md');
                        }}
                        className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex items-center space-x-2 ${
                            activeTab === 'PRIVACY.md'
                                ? 'border-primary text-white bg-white/5'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                    >
                         <Shield size={12}/>
                        <span>PRIVACY.md</span>
                    </button>
                    <button
                        onClick={() => {
                            if (!readmeContent) handleGenerateReadme();
                            else setActiveTab('README.md');
                        }}
                        className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex items-center space-x-2 ${
                            activeTab === 'README.md'
                                ? 'border-primary text-white bg-white/5'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                    >
                         <FileText size={12}/>
                        <span>README.md</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="relative flex-1 bg-[#0d1117] p-4 overflow-auto">
                    {config.name ? (
                         <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
                            {currentFileContent}
                        </pre>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-600 flex-col">
                            <Play size={48} className="mb-4 opacity-50" />
                            <p>Start by entering an app name</p>
                        </div>
                    )}
                   
                   {/* Quick Actions for Active File */}
                   {config.name && (
                       <div className="absolute top-4 right-4 flex space-x-2">
                           <button 
                                onClick={() => copyToClipboard(currentFileContent)}
                                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md border border-gray-700 transition-colors"
                                title="Copy to Clipboard"
                            >
                                <Copy size={16} />
                            </button>
                            <button 
                                onClick={() => {
                                    if(activeTab === 'README.md') {
                                        downloadFile({ name: 'README.md', content: readmeContent, language: 'markdown' });
                                    } else if (activeTab === 'PRIVACY.md') {
                                         downloadFile({ name: 'PRIVACY.md', content: privacyPolicyContent, language: 'markdown' });
                                    } else {
                                        const f = generatedFiles.find(f => f.name === activeTab);
                                        if (f) downloadFile(f);
                                    }
                                }}
                                className="p-2 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors shadow-lg shadow-primary/20"
                                title="Download File"
                            >
                                <Download size={16} />
                            </button>
                       </div>
                   )}
                </div>

                {/* Footer Info */}
                <div className="px-4 py-3 bg-card border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
                    <div className="truncate max-w-[60%]">
                        {activeTab === 'manifest.json' && 'Web App Manifest for PWAs'}
                        {activeTab === 'package.json' && 'Dependency Config for Electron'}
                        {activeTab === 'main.js' && 'Main Process for Electron'}
                        {activeTab === 'README.md' && 'AI Generated Instructions'}
                        {activeTab === 'capacitor.config.json' && 'Cross-platform Mobile Config'}
                        {activeTab === 'AndroidManifest.xml' && 'Android Permissions Definition'}
                        {activeTab === 'Info.plist' && 'iOS Permissions & Config'}
                    </div>
                    {/* Mobile Only Download Button (since header button is hidden on mobile) */}
                    <button 
                        onClick={handleDownloadZip}
                        disabled={!config.name || isZipping}
                        className="md:hidden flex items-center space-x-1 text-primary hover:text-white"
                    >
                         <Archive size={12} />
                         <span>{isZipping ? "Bundling..." : "Bundle ZIP"}</span>
                    </button>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}