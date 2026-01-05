import React from 'react';

export const FolderProgress = ({ percentage }: { percentage: number }) => {
    const size = 60;
    const center = size / 2;
    const strokeWidth = 5;
    const radius = 22; // Slightly reduced to fit glow
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    // Calculate pointer position
    const angleInRadians = (percentage / 100) * 2 * Math.PI;
    const pointerX = center + radius * Math.cos(angleInRadians);
    const pointerY = center + radius * Math.sin(angleInRadians);

    return (
        <div className="relative w-[60px] h-[60px] flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background Circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="#F2F7FA"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />

                {/* Progress Circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="#00AAFF"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />

                {/* Pointer with Glow */}
                <g className="transition-all duration-500 ease-out">
                    {/* Glow/Shadow Layer (Blue) */}
                    <circle
                        cx={pointerX}
                        cy={pointerY}
                        r={6}
                        fill="#00AAFF"
                        style={{ filter: 'blur(3px)', opacity: 0.6 }}
                    />
                    {/* Main Dot (White) */}
                    <circle
                        cx={pointerX}
                        cy={pointerY}
                        r={3.5}
                        fill="white"
                    />
                </g>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-[#1A1A1A]">
                {percentage}%
            </span>
        </div>
    );
};
