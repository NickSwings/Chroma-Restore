import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageSliderProps {
  originalImage: string;
  processedImage: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ originalImage, processedImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ('touches' in e ? (e as any).touches[0].clientX : (e as MouseEvent).clientX) - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, [isResizing]);

  // Global mouse up to catch dragging outside component
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleMouseMove as any);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove as any);
    };
  }, [isResizing, handleMouseUp, handleMouseMove]);


  return (
    <div 
      className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-xl shadow-2xl border border-slate-700 select-none group"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      style={{ touchAction: 'none' }} // Prevent scrolling on mobile while dragging
    >
      {/* Background (Processed - Color) */}
      <img 
        src={`data:image/png;base64,${processedImage}`} 
        alt="Colorized" 
        className="block w-full h-auto object-contain pointer-events-none"
      />
      
      {/* Label for Colorized */}
      <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm z-10 pointer-events-none">
        COLOR
      </div>

      {/* Foreground (Original - BW) - Clipped */}
      <div 
        className="absolute top-0 left-0 h-full overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={originalImage} // Original usually has data URL prefix already if from FileReader
          alt="Original" 
          className="block w-full max-w-none h-full object-contain"
          // Important: We need to ensure this image scales exactly like the background image. 
          // Since we are using object-contain on the parent container logic, it's tricky.
          // Better approach: Both images should fill the container.
          // Let's rely on the parent container aspect ratio if possible, or force standard dimensions.
          // Actually, 'max-w-none' + 'h-full' + 'w-[containerWidth]' is needed.
          // But since the container width is dynamic, we need to match the background image size.
          // The simplest way in pure CSS comparison is to set dimensions.
          // However, here we just let 'w-full' of the PARENT match.
          style={{ width: containerRef.current?.offsetWidth }}
        />
        
        {/* Label for Original */}
        <div className="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
          B&W
        </div>
      </div>

      {/* Slider Line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#0f172a" className="w-5 h-5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l-5-5 5-5m4 0l5 5-5 5" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;