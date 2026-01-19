import React, { useState, useEffect } from 'react';
import { fileToBase64, colorizeImage } from './services/gemini';
import { AppStatus, ProcessedImage, ProcessingError } from './types';
import Uploader from './components/Uploader';
import ImageSlider from './components/ImageSlider';
import { SparklesIcon, DownloadIcon, RefreshIcon, CompareIcon } from './components/Icons';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [imageState, setImageState] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<ProcessingError | null>(null);
  const [hint, setHint] = useState<string>('');
  const [loadingText, setLoadingText] = useState("Analyzing image structure...");

  const loadingMessages = [
    "Analyzing image structure...",
    "identifying historical context...",
    "Applying chromatic layers...",
    "Enhancing skin tones...",
    "Finalizing details..."
  ];

  useEffect(() => {
    if (status === AppStatus.PROCESSING) {
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[i]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleFileSelect = async (file: File) => {
    try {
      setStatus(AppStatus.IDLE);
      setError(null);
      setImageState(null);

      // Preview original
      const base64 = await fileToBase64(file);
      // We prepend the data type for the preview img src
      const dataUrl = `data:${file.type};base64,${base64}`;
      
      setImageState({
        original: dataUrl,
        processed: null,
        originalFile: file
      });

    } catch (e: any) {
      setError({ message: "Failed to read file", details: e.message });
    }
  };

  const handleColorize = async () => {
    if (!imageState || !imageState.original) return;

    try {
      setStatus(AppStatus.PROCESSING);
      setError(null);

      // Extract raw base64 without prefix for API
      const base64Raw = imageState.original.split(',')[1];
      
      const resultBase64 = await colorizeImage(base64Raw, hint);

      setImageState(prev => prev ? ({ ...prev, processed: resultBase64 }) : null);
      setStatus(AppStatus.COMPLETE);

    } catch (e: any) {
      setStatus(AppStatus.ERROR);
      setError({ message: "Colorization failed", details: e.message });
    }
  };

  const handleDownload = () => {
    if (!imageState?.processed) return;
    
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageState.processed}`;
    link.download = `chroma-restored-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setImageState(null);
    setHint('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <CompareIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              ChromaRestore
            </h1>
          </div>
          <div className="text-sm font-medium text-slate-500">
            Powered by Gemini
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start p-6 md:p-12 space-y-8">
        
        {/* Hero Text (only when idle or initial upload) */}
        {!imageState && (
          <div className="text-center space-y-4 max-w-2xl mt-10 mb-6">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Bring your memories <span className="text-indigo-400">to life</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Instantly transform black and white photos into vibrant, realistic color images using advanced AI.
            </p>
          </div>
        )}

        {/* Upload State */}
        {!imageState && (
          <div className="w-full max-w-2xl animate-fade-in-up">
            <Uploader onFileSelect={handleFileSelect} />
          </div>
        )}

        {/* Processing/Result State */}
        {imageState && (
          <div className="w-full max-w-5xl flex flex-col items-center space-y-8 animate-fade-in">
            
            {/* Toolbar */}
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-800/40 border border-slate-700 rounded-xl backdrop-blur-sm">
              <button 
                onClick={handleReset}
                className="text-slate-400 hover:text-white flex items-center text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-700/50"
              >
                <RefreshIcon className="w-4 h-4 mr-2" />
                New Image
              </button>
              
              {status === AppStatus.COMPLETE && (
                <button 
                  onClick={handleDownload}
                  className="bg-white text-slate-900 hover:bg-slate-200 px-6 py-2.5 rounded-lg font-semibold flex items-center shadow-lg shadow-white/5 transition-all active:scale-95"
                >
                  <DownloadIcon className="w-5 h-5 mr-2" />
                  Download Colorized
                </button>
              )}
            </div>

            {/* Main Visual Area */}
            <div className="w-full relative min-h-[400px] flex items-center justify-center bg-slate-950/50 border border-slate-800 rounded-2xl p-4 shadow-2xl overflow-hidden">
              
              {status === AppStatus.IDLE && (
                <div className="relative w-full max-w-2xl">
                   <img 
                    src={imageState.original} 
                    alt="Original" 
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex flex-col justify-end p-6 rounded-lg">
                     <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Optional Hint</label>
                          <input 
                            type="text"
                            placeholder="e.g., The car is red, the dress is blue..."
                            value={hint}
                            onChange={(e) => setHint(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <button 
                          onClick={handleColorize}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center"
                        >
                          <SparklesIcon className="w-5 h-5 mr-2" />
                          Colorize Photo
                        </button>
                     </div>
                  </div>
                </div>
              )}

              {status === AppStatus.PROCESSING && (
                 <div className="flex flex-col items-center justify-center p-12 space-y-6">
                    <div className="relative w-24 h-24">
                       <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                       <SparklesIcon className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold text-white">Magic in progress</h3>
                      <p className="text-slate-400 min-w-[200px]">{loadingText}</p>
                    </div>
                 </div>
              )}

              {status === AppStatus.COMPLETE && imageState.processed && (
                <div className="w-full flex flex-col items-center">
                  <ImageSlider 
                    originalImage={imageState.original} 
                    processedImage={imageState.processed} 
                  />
                  <p className="text-sm text-slate-500 mt-4">Drag the slider to compare before and after</p>
                </div>
              )}

              {status === AppStatus.ERROR && (
                <div className="text-center p-8 max-w-md">
                   <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                     <span className="text-red-500 text-2xl">!</span>
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
                   <p className="text-slate-400 mb-6">{error?.details || error?.message || "An unknown error occurred."}</p>
                   <button 
                      onClick={() => setStatus(AppStatus.IDLE)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
                   >
                     Try Again
                   </button>
                </div>
              )}

            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} ChromaRestore. All rights reserved.</p>
          <p className="mt-2 text-slate-600">Images are processed in memory and not permanently stored.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
