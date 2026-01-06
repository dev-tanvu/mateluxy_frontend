'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSystemSettings } from '@/services/integration.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function SystemSettingsCard({ currentTimeZone }: { currentTimeZone: string }) {
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
                            Configure your CRM&apos;s time zone for automated syncing schedules (every 6 hours starting 12:00 AM local time).
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
