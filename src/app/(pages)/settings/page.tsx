'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSystemSettings } from '@/services/integration.service';
import { NotificationSoundCard } from '@/components/settings/notification-sound-card';
import { AiTrainingSection } from '@/components/integrations/ai-training-section';
import { SystemSettingsCard } from '@/components/settings/system-settings-card';
import { SettingsSidebar } from '@/components/settings/settings-sidebar';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'ai'>('general');

    const { data: systemSettings, isLoading } = useQuery({
        queryKey: ['integrations'],
        queryFn: getSystemSettings
    });

    // Content renderer based on active tab
    const renderContent = () => {
        if (isLoading && activeTab === 'general') {
            return (
                <div className="h-[300px] w-full bg-gray-50 animate-pulse rounded-[24px]" />
            );
        }

        switch (activeTab) {
            case 'general':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
                            <p className="text-gray-500">Manage your system preferences and regional settings.</p>
                        </div>
                        <SystemSettingsCard currentTimeZone={systemSettings?.timeZone || 'UTC'} />
                    </div>
                );
            case 'notifications':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                            <p className="text-gray-500">Configure how you want to be alerted.</p>
                        </div>
                        <NotificationSoundCard />
                    </div>
                );
            case 'ai':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">AI & Content</h2>
                            <p className="text-gray-500">Train your tailored AI model and adjust generation settings.</p>
                        </div>
                        <AiTrainingSection />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans p-8">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
                    {/* Sidebar */}
                    <div className="sticky top-8">
                        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
                    </div>

                    {/* Main Content Area */}
                    <main className="min-h-[500px]">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
}
