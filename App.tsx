
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai"; // Ensure GoogleGenAI is imported, even if just for type checking or future use.
import { StylePreset, AspectRatio, StockModel } from './types';
import { STOCK_MODELS } from './constants';
import { generatePhotoshootImage } from './services/geminiService';
import ParticleBackground from './components/ParticleBackground';
import ImageUpload from './components/ImageUpload';

// Helper components defined outside the main App component
const Loader: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 border-4 border-cyan-400 border-dashed rounded-full animate-spin"></div>
    <p className="text-cyan-300 text-lg">{message}</p>
  </div>
);

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}
const NeonButton: React.FC<NeonButtonProps> = ({ children, ...props }) => (
  <button
    {...props}
    className="w-full bg-cyan-500/20 text-cyan-300 border border-cyan-500 rounded-lg px-6 py-3 font-bold uppercase tracking-wider
               hover:bg-cyan-500/40 hover:text-white hover:shadow-[0_0_15px_#06b6d4,0_0_25px_#06b6d4]
               transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-500/20 disabled:hover:shadow-none"
  >
    {children}
  </button>
);


const App: React.FC = () => {
  const [modelImage, setModelImage] = useState<File | string | null>(null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [modelImageUrl, setModelImageUrl] = useState<string | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  
  const [prompt, setPrompt] = useState<string>("A model holding a product in a dynamic, energetic pose.");
  const [activeStyle, setActiveStyle] = useState<StylePreset>(StylePreset.Studio);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Square);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelImage) {
        setModelImageUrl(null);
        return;
    }
    if (typeof modelImage === 'string') {
        setModelImageUrl(modelImage);
    } else {
        const objectUrl = URL.createObjectURL(modelImage);
        setModelImageUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }
  }, [modelImage]);

  useEffect(() => {
    if (!productImage) {
        setProductImageUrl(null);
        return;
    }
    const objectUrl = URL.createObjectURL(productImage);
    setProductImageUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [productImage]);

  const handleGenerate = async () => {
    if (!modelImage || !productImage || !prompt) {
      setError("Please upload both a model and product image, and enter a prompt.");
      return;
    }
    
    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);
    setLoadingMessage("Warming up the AI studio...");

    try {
        const result = await generatePhotoshootImage(modelImage, productImage, prompt, activeStyle, aspectRatio);
        setGeneratedImage(result);
    } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'novashoot-ai-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleModelSelect = (image: File | string) => {
    setGeneratedImage(null);
    setError(null);
    setModelImage(image);
  };

  const handleProductSelect = (image: File | string) => {
    setGeneratedImage(null);
    setError(null);
    if (typeof image === 'object') {
      setProductImage(image);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-gray-200 font-sans">
      <ParticleBackground />
      <main className="relative z-10 p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
              NovaShoot AI
            </span>
          </h1>
          <p className="mt-2 text-lg text-cyan-200/80">Multi-tool Hub – AI Nova Shoot Studio</p>
        </header>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <div className="bg-black/20 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6 space-y-6 shadow-2xl shadow-cyan-500/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUpload title="1. Upload Model" id="model-upload" onImageSelect={handleModelSelect} selectedImageUrl={modelImageUrl}>
                <div className="mt-2">
                    <p className="text-xs text-center text-gray-400 mb-2">Or select a stock model</p>
                    <div className="grid grid-cols-4 gap-2">
                        {STOCK_MODELS.map(model => (
                            <img key={model.id} src={model.url} alt={model.name}
                                 onClick={(e) => { e.stopPropagation(); handleModelSelect(model.url); }}
                                 className={`w-full aspect-square object-cover rounded-md cursor-pointer border-2 transition-all ${modelImageUrl === model.url ? 'border-cyan-400' : 'border-transparent hover:border-cyan-500/50'}`} />
                        ))}
                    </div>
                </div>
              </ImageUpload>
              <ImageUpload title="2. Upload Product" id="product-upload" onImageSelect={handleProductSelect} selectedImageUrl={productImageUrl}/>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">3. Add Creative Instructions</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A futuristic ad for a new soda..."
                className="w-full h-24 bg-gray-900/50 border-2 border-cyan-500/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300
                           focus:shadow-[0_0_10px_#06b6d4] resize-none"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">4. Select Style & Size</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    {Object.values(StylePreset).map(preset => (
                        <button key={preset} onClick={() => setActiveStyle(preset)}
                                className={`w-full text-left p-2 rounded-md text-sm transition-all duration-200 ${activeStyle === preset ? 'bg-cyan-500/30 text-white font-semibold' : 'bg-gray-800/50 hover:bg-gray-700/70'}`}>
                            {preset}
                        </button>
                    ))}
                 </div>
                 <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                         className="w-full h-12 bg-gray-900/50 border-2 border-cyan-500/50 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400">
                    {Object.values(AspectRatio).map(ratio => (
                        <option key={ratio} value={ratio} className="bg-gray-900">{ratio}</option>
                    ))}
                 </select>
              </div>
            </div>

            <NeonButton onClick={handleGenerate} disabled={isLoading || !modelImage || !productImage}>
              {isLoading ? 'Generating...' : 'Generate Photoshoot'}
            </NeonButton>
          </div>

          {/* Output Panel */}
          <div className="bg-black/20 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6 flex items-center justify-center min-h-[400px] lg:min-h-full shadow-2xl shadow-fuchsia-500/10">
            {isLoading ? (
              <Loader message={loadingMessage} />
            ) : error ? (
              <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Generation Failed</h3>
                <p>{error}</p>
              </div>
            ) : generatedImage ? (
              <div className="w-full space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-center mb-2">Original Product</h4>
                        <img src={productImageUrl || ''} alt="Original Product" className="w-full aspect-square object-contain rounded-lg bg-gray-900/50" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-center mb-2">AI Generated Photoshoot</h4>
                        <img src={generatedImage} alt="Generated Photoshoot" className="w-full aspect-square object-contain rounded-lg bg-gray-900/50" />
                    </div>
                </div>
                <NeonButton onClick={handleDownload}>Download Image</NeonButton>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <h2 className="text-2xl font-bold text-cyan-300">Your AI Photoshoot Awaits</h2>
                <p>Configure your settings on the left and click "Generate".</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
