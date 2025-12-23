
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIntegrations, updateIntegration, disconnectIntegration, IntegrationConfig } from '@/services/integration.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, Clock, Globe } from 'lucide-react';
import { updateSystemSettings } from '@/services/integration.service';
import { toast } from 'sonner';

function SystemSettingsCard({ currentTimeZone }: { currentTimeZone: string }) {
    const queryClient = useQueryClient();
    const [timeZone, setTimeZone] = useState(currentTimeZone);
    const [isEditing, setIsEditing] = useState(false);

    // Sync state when prop updates from fetch
    React.useEffect(() => {
        setTimeZone(currentTimeZone);
    }, [currentTimeZone]);

    const mutation = useMutation({
        mutationFn: updateSystemSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
            setIsEditing(false);
            toast.success('Time zone updated successfully');
        }
    });

    const handleSave = () => {
        mutation.mutate(timeZone);
    };

    const timeZones = Intl.supportedValuesOf('timeZone');

    return (
        <Card className="p-8 border border-[#EDF1F7] bg-white rounded-[24px] shadow-none mb-8">
            <div className="flex justify-between items-start">
                <div className="flex gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl h-fit">
                        <Globe className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[18px] text-[#111827] mb-1">Geographic Settings</h3>
                        <p className="text-[14px] text-[#6B7280]">
                            Configure your CRM's time zone for automated syncing schedules (every 6 hours starting 12:00 AM local time).
                        </p>

                        <div className="mt-6 max-w-md">
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Time Zone</Label>
                            <div className="flex gap-3">
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={timeZone}
                                    onChange={(e) => setTimeZone(e.target.value)}
                                    disabled={!isEditing}
                                >
                                    {timeZones.map((tz) => (
                                        <option key={tz} value={tz}>{tz}</option>
                                    ))}
                                </select>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setTimeZone(currentTimeZone); }}>Cancel</Button>
                                        <Button size="sm" onClick={handleSave} disabled={mutation.isPending}>
                                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                                        Change
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Current Sync Schedule: 12:00 AM, 06:00 AM, 12:00 PM, 06:00 PM ({timeZone})
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

const availableIntegrations = [
    {
        key: 'property_finder',
        name: 'Property Finder',
        description: 'Upload and sync your property listings directly to Property Finder marketplace.',
        icon: '/property_finder_icon.svg',
        fields: [
            { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Enter your API key' },
            { key: 'apiSecret', label: 'Secret Key', type: 'password', placeholder: 'Enter your secret key' },
            { key: 'companyOrn', label: 'Company ORN (License Number)', type: 'text', placeholder: 'Enter your company ORN/license number' }
        ]
    },
    {
        key: 'meta',
        name: 'Facebook', // Renamed from Meta as per icon request
        description: 'Capture and track leads from Facebook & Instagram campaigns seamlessly.',
        icon: '/facebook_icon.svg',
        fields: [
            { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Enter Access Token' },
            { key: 'pixelId', label: 'Pixel ID', type: 'text', placeholder: 'Enter Pixel ID' }
        ]
    },
    {
        key: 'tiktok_ads',
        name: 'TikTok Ads',
        description: 'Run engaging ad campaigns to generate real estate leads from TikTok.',
        icon: '/tiktok_icon.svg',
        fields: [
            { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Enter Access Token' }
        ]
    },

    {
        key: 'whatsapp',
        name: 'WhatsApp API',
        description: 'Capture and track leads from Facebook & Instagram campaigns seamlessly.',
        icon: '/whatsapp_icon_.svg',
        fields: [
            { key: 'phoneNumber', label: 'Phone Number', type: 'text', placeholder: '+971...' },
            { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter API Key' }
        ]
    }
];

export default function IntegrationsPage() {
    const queryClient = useQueryClient();
    const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
    const [isConnectOpen, setIsConnectOpen] = useState(false);
    const [formValues, setFormValues] = useState<any>({});

    const { data: configs, isLoading } = useQuery({
        queryKey: ['integrations'],
        queryFn: getIntegrations
    });

    const connectMutation = useMutation({
        mutationFn: (data: { provider: string, credentials: any }) =>
            updateIntegration(data.provider, { isEnabled: true, credentials: data.credentials }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
            setIsConnectOpen(false);
            setFormValues({});
            setSelectedIntegration(null);
        }
    });

    const disconnectMutation = useMutation({
        mutationFn: (provider: string) => disconnectIntegration(provider),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
        }
    });

    const handleConnectClick = (integration: any) => {
        setSelectedIntegration(integration);
        setFormValues({});
        setIsConnectOpen(true);
    };

    const handleDisconnectClick = (provider: string) => {
        if (confirm('Are you sure you want to disconnect?')) {
            disconnectMutation.mutate(provider);
        }
    };

    const handleSave = () => {
        if (!selectedIntegration) return;
        connectMutation.mutate({
            provider: selectedIntegration.key,
            credentials: formValues
        });
    };

    const isConnected = (key: string) => {
        const config = configs?.find((c: IntegrationConfig) => c.provider === key);
        return config?.isEnabled || false;
    };

    // Skeleton for integration cards
    const IntegrationCardSkeleton = () => (
        <div className="relative overflow-hidden p-6 flex flex-col justify-between h-[210px] rounded-[24px] border border-[#EDF1F7] bg-white animate-pulse">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                        <div className="h-5 w-28 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-5 h-5 bg-gray-100 rounded"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-100 rounded"></div>
                    <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 w-24 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="p-8 space-y-8 bg-white min-h-screen font-sans">
                <div>
                    <div className="h-6 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
                    <div className="p-8 border border-[#EDF1F7] bg-white rounded-[24px] animate-pulse mb-8">
                        <div className="flex gap-4">
                            <div className="p-3 bg-gray-100 rounded-xl h-fit w-12 h-12"></div>
                            <div className="flex-1">
                                <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 w-full max-w-md bg-gray-100 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="h-6 w-36 bg-gray-200 rounded mb-6 animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => <IntegrationCardSkeleton key={i} />)}
                    </div>
                </div>
                <div>
                    <div className="h-6 w-40 bg-gray-200 rounded mb-6 animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(4)].map((_, i) => <IntegrationCardSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    const suggestions = availableIntegrations.slice(0, 3);

    return (
        <div className="p-8 space-y-8 bg-white min-h-screen font-sans">
            <div>
                <h2 className="text-[22px] font-bold mb-6 text-[#111827]">Global CRM Settings</h2>
                <SystemSettingsCard
                    currentTimeZone={configs?.find((c: any) => c.provider === 'system_settings')?.credentials?.timeZone || 'UTC'}
                />
            </div>

            <div>
                <h2 className="text-[22px] font-bold mb-6 text-[#111827]">Suggested for your</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestions.map((integration) => (
                        <IntegrationCard
                            key={integration.key}
                            integration={integration}
                            isConnected={isConnected(integration.key)}
                            onConnect={() => handleConnectClick(integration)}
                            onDisconnect={() => handleDisconnectClick(integration.key)}
                        />
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-[22px] font-bold mb-6 text-[#111827]">All Integrations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableIntegrations.map((integration) => (
                        <IntegrationCard
                            key={integration.key}
                            integration={integration}
                            isConnected={isConnected(integration.key)}
                            onConnect={() => handleConnectClick(integration)}
                            onDisconnect={() => handleDisconnectClick(integration.key)}
                        />
                    ))}
                </div>
            </div>

            {/* Connect Modal */}
            <Dialog open={isConnectOpen} onOpenChange={setIsConnectOpen}>
                <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] sm:max-w-[420px] p-0 rounded-[32px] overflow-visible bg-white shadow-xl border-0 !gap-0 z-50 [&>button]:z-[60]">
                    {/* Background Blobs inside Modal */}
                    <div
                        className="absolute w-[150px] h-[150px] bg-[#00BBFF] rounded-full pointer-events-none"
                        style={{
                            right: '-40px',
                            top: '-40px',
                            opacity: 0.04,
                            filter: 'blur(50px)'
                        }}
                    />
                    <div
                        className="absolute w-[150px] h-[150px] bg-[#FFDD00] rounded-full pointer-events-none"
                        style={{
                            left: '-40px',
                            bottom: '-40px',
                            opacity: 0.04,
                            filter: 'blur(50px)'
                        }}
                    />

                    <div className="p-8 relative z-10">
                        <DialogHeader className="mb-8 space-y-0">
                            <DialogTitle className="flex items-center gap-3 text-[22px] font-bold text-[#111827]">
                                <img src={selectedIntegration?.icon} alt="" className="w-7 h-7 object-contain" />
                                {selectedIntegration?.name}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                            {selectedIntegration?.fields.map((field: any, index: number) => (
                                <div key={field.key} className="space-y-2">
                                    <Label className="text-[14px] font-medium text-[#6B7280] ml-1">{field.label}</Label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                                            {field.key.toLowerCase().includes('secret') || field.type === 'password' ? (
                                                <Lock size={18} strokeWidth={2} />
                                            ) : (
                                                // Key icon SVG or Lucide Key
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" /></svg>
                                            )}
                                        </div>
                                        <Input
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            value={formValues[field.key] || ''}
                                            onChange={(e) => setFormValues({ ...formValues, [field.key]: e.target.value })}
                                            className="pl-12 h-[56px] rounded-[16px] border border-[#F3F4F6] bg-transparent text-[15px] placeholder:text-[#9CA3AF] focus:border-[#00B7FF] focus:ring-0 shadow-none transition-all"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-10">
                            <Button
                                variant="ghost"
                                onClick={() => setIsConnectOpen(false)}
                                className="text-[#6B7280] hover:text-[#1F2937] hover:bg-transparent font-medium text-[16px] h-auto p-0"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={connectMutation.isPending}
                                className="bg-[#00B7FF] hover:bg-[#0099DD] text-white rounded-[14px] h-[52px] px-8 font-semibold text-[16px] shadow-none min-w-[140px]"
                            >
                                {connectMutation.isPending ? 'Connecting...' : 'Connect'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function IntegrationCard({ integration, isConnected, onConnect, onDisconnect }: any) {
    return (
        <Card className="relative overflow-hidden p-6 flex flex-col justify-between h-[210px] rounded-[24px] border border-[#EDF1F7] bg-white transition-all shadow-none">
            {/* Background Blobs */}
            <div
                className="absolute w-[70px] h-[70px] bg-[#00BBFF] rounded-full pointer-events-none"
                style={{
                    left: '74px',
                    top: '-12px',
                    opacity: 0.07,
                    filter: 'blur(100px)'
                }}
            />
            <div
                className="absolute w-[70px] h-[70px] bg-[#FFDD00] rounded-full pointer-events-none"
                style={{
                    left: '-19px',
                    top: '189px',
                    opacity: 0.07,
                    filter: 'blur(100px)' // Assuming same blur for consistency
                }}
            />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <img src={integration.icon} alt={integration.name} className="w-8 h-8 object-contain" />
                        <h3 className="font-bold text-[18px] text-[#111827]">{integration.name}</h3>
                    </div>
                    {/* 3-dots menu */}
                    <button className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors p-1">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <circle cx="10" cy="4" r="1.5" />
                            <circle cx="10" cy="10" r="1.5" />
                            <circle cx="10" cy="16" r="1.5" />
                        </svg>
                    </button>
                </div>
                <p className="text-[14px] text-[#6B7280] leading-[1.6] line-clamp-2">{integration.description}</p>
            </div>

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-[8px] h-[8px] rounded-full ${isConnected ? 'bg-[#22C55E]' : 'bg-[#D1D5DB]'}`} />
                    <span className={`text-[14px] font-medium ${isConnected ? 'text-[#22C55E]' : 'text-[#9CA3AF]'}`}>
                        {isConnected ? 'Connected' : 'Not connected'}
                    </span>
                </div>
                <Button
                    onClick={isConnected ? onDisconnect : onConnect}
                    className="bg-[#00B7FF] hover:bg-[#0099DD] text-white rounded-[12px] h-[40px] px-6 text-[14px] font-medium shadow-none"
                    size="default"
                >
                    {isConnected ? 'Disconnect' : 'Connect'}
                </Button>
            </div>
        </Card>
    );
}
