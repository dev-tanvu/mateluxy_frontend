import React from 'react';
import Image from 'next/image';
import { BarChart3 } from 'lucide-react';

export function AuthHero() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center p-12 text-white">
            {/* Mock Dashboard Preview */}
            {/* Mock Dashboard Preview */}
            <div className="relative mb-12 w-full max-w-lg bg-transparent">
                <Image
                    src="https://crm-essential-images.s3.us-east-1.amazonaws.com/CRM+Preview.png"
                    alt="Dashboard Preview"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                    priority
                />
            </div>

            {/* Hero Text */}
            <div className="text-center max-w-md">
                <h2 className="text-3xl font-bold mb-4">
                    The easiest way to manage your customer relationships.
                </h2>
                <p className="text-blue-100 text-lg">
                    Streamline your workflow, boost sales, and keep your customers happy with Mateluxy CRM.
                </p>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-blue-500 opacity-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-blue-400 opacity-20 blur-3xl" />
        </div>
    );
}
