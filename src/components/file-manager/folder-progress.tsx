import React from 'react';

export const FolderProgress = ({ percentage }: { percentage: number }) => {
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    stroke="#F2F7FA"
                    strokeWidth="3"
                    fill="transparent"
                />
                {/* Progress Circle */}
                <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    stroke="#00AAFF"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#1A1A1A]">
                {percentage}%
            </span>
        </div>
    );
};
