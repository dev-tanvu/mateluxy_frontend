'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Settings, Bell, Sparkles } from 'lucide-react';

interface SettingsSidebarProps {
    activeTab: 'general' | 'notifications' | 'ai';
    onTabChange: (tab: 'general' | 'notifications' | 'ai') => void;
}

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
    const navItems = [
        {
            id: 'general',
            label: 'General Settings',
            icon: Settings,
            description: 'Time zone & system preferences'
        },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            description: 'Sound alerts & preferences'
        },
        {
            id: 'ai',
            label: 'AI & Content',
            icon: Sparkles,
            description: 'Model training & generation'
        }
    ] as const;

    return (
        <div className="flex flex-col gap-2">
            <div className="px-4 py-2">
                <h2 className="text-lg font-bold text-gray-900">Settings</h2>
                <p className="text-sm text-gray-500">Manage your preferences</p>
            </div>

            <div className="space-y-1 mt-4">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group",
                                isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-lg transition-colors",
                                isActive ? "bg-blue-100" : "bg-gray-100 group-hover:bg-white"
                            )}>
                                <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-gray-500")} />
                            </div>
                            <div>
                                <p className={cn("text-sm font-semibold", isActive ? "text-blue-900" : "text-gray-700")}>
                                    {item.label}
                                </p>
                                {/* Hide description on smaller screens or if too cluttered? Keeping it for 'professional' feel */}
                                <p className={cn("text-xs mt-0.5", isActive ? "text-blue-600/80" : "text-gray-400")}>
                                    {item.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
