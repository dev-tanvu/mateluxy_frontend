'use client';

import React, { useState, useRef } from 'react';
import { FileText, Upload, ArrowUpRight, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NocSelectionStepProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
    onNext: () => void;
    onBack: () => void;
}

export function NocSelectionStep({ file, onFileChange, onNext, onBack }: NocSelectionStepProps) {
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Simulate upload when file changes and is not null
    React.useEffect(() => {
        if (file) {
            setUploadProgress(0);
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 200);
            return () => clearInterval(interval);
        } else {
            setUploadProgress(0);
        }
    }, [file]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileChange(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileChange(e.dataTransfer.files[0]);
        }
    };

    const removeFile = () => {
        onFileChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            {/* Header */}
            <h1 className="text-3xl font-bold text-center text-gray-900 pt-4">Upload or create NOC</h1>

            <div className="space-y-6">
                {/* Create NOC Card */}
                <button className="w-full group relative p-5 rounded-2xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md transition-all text-left flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                            <FileText className="w-5 h-5 text-gray-600 group-hover:text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">Create Mateluxy NOC</h3>
                            <p className="text-xs text-gray-500">Quickly prepare your property NOC in just a few steps.</p>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                    </div>
                </button>

                {/* Divider */}
                <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">Or</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Upload Area or File Progress */}
                {!file ? (
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center hover:bg-gray-50 transition-colors bg-white"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-1">
                                <Upload className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">Choose a file or drag & drop it here</h3>
                                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, PDF, and MP4 formats, up to 50MB</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept=".jpg,.jpeg,.png,.pdf,.mp4"
                            />
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-2 px-6 h-10 rounded-xl border-gray-200 text-gray-600 text-sm font-medium hover:text-gray-900 hover:bg-gray-50"
                            >
                                Browse File
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-red-500">PDF</span>
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                <button onClick={removeFile} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-1.5">
                                <span>{(file.size / 1024).toFixed(0)} KB of {(file.size / 1024).toFixed(0)} KB</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-blue-500">
                                    {uploadProgress < 100 ? 'Uploading...' : 'Completed'}
                                </span>
                            </div>
                            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6">
                <button
                    onClick={onBack}
                    className="px-6 py-2.5 text-gray-600 font-medium hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center gap-2 text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <button
                    onClick={onNext}
                    disabled={!file || uploadProgress < 100}
                    className={`px-8 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${file && uploadProgress === 100
                            ? 'bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD]'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
