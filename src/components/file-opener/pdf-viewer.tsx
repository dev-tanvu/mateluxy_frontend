'use client';

import React from 'react';
import { X, Download, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileOpener } from './file-opener-context';

export function PDFViewer() {
    const { file, isOpen, closeFile, nextFile, prevFile, files } = useFileOpener();

    if (!file || file.type !== 'pdf' || !isOpen) return null;

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = file.url;
        a.target = '_blank';
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handlePrint = () => {
        const printWindow = window.open(file.url, '_blank');
        if (printWindow) {
            printWindow.onload = () => printWindow.print();
        }
    };

    const hasNavigation = files && files.length > 1;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-sm shadow-md z-10">
                <div className="flex items-center gap-4">
                    <h2 className="text-white font-medium truncate max-w-md">{file.name}</h2>
                </div>
                <div className="flex items-center gap-2">
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
                        onClick={handlePrint}
                        className="text-white hover:bg-white/20"
                        title="Print"
                    >
                        <Printer className="w-5 h-5" />
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

            {/* PDF Viewer Container */}
            <div className="flex-1 p-8 relative flex items-center justify-center bg-gray-900/50">

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

                <iframe
                    src={`${file.url}#toolbar=0`}
                    className="w-full h-full rounded-lg bg-white shadow-2xl max-w-6xl mx-auto"
                    title={file.name}
                />
            </div>
        </div>
    );
}
