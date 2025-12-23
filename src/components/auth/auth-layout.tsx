import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    hero: React.ReactNode;
}

export function AuthLayout({ children, hero }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side - Form */}
            <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24 bg-white">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    {children}
                </div>
            </div>

            {/* Right Side - Hero */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden">
                {hero}
            </div>
        </div>
    );
}
