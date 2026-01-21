'use client';

import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileOpener } from './file-opener-context';

export function ImageViewer() {
    const { file, isOpen, closeFile, nextFile, prevFile, files } = useFileOpener();
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    if (!file || file.type !== 'image' || !isOpen) return null;

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = file.url;
        a.target = '_blank';
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);

    const hasNavigation = files && files.length > 1;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/90 flex flex-col animate-in fade-in duration-200"
            onClick={closeFile}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-10"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-white font-medium truncate max-w-md">{file.name}</h2>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomOut}
                        className="text-white hover:bg-white/20"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </Button>
                    <span className="text-white text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomIn}
                        className="text-white hover:bg-white/20"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRotate}
                        className="text-white hover:bg-white/20"
                        title="Rotate"
                    >
                        <RotateCw className="w-5 h-5" />
                    </Button>
                    <div className="w-px h-6 bg-white/20 mx-2" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownload}
                        className="text-white hover:bg-white/20"
                        title="Download"
                    >
                        <Download className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={closeFile}
                        className="text-white hover:bg-white/20"
                        title="Close (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Image Container */}
            <div
                className="flex-1 flex items-center justify-center overflow-hidden p-8 relative w-full h-full"
                onClick={e => e.stopPropagation()}
            >
                {/* Navigation Buttons */}
                {hasNavigation && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevFile(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all hover:scale-110 z-20 group"
                        >
                            <ChevronLeft className="w-8 h-8 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextFile(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all hover:scale-110 z-20 group"
                        >
                            <ChevronRight className="w-8 h-8 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </>
                )}

                <img
                    src={file.url}
                    alt={file.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                    style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    }}
                    onClick={e => e.stopPropagation()}
                />
            </div>
        </div>
    );
}
