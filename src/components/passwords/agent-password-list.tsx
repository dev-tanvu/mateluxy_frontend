
'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAgentPasswords, deleteAgentPassword, AgentPassword } from '@/services/agent-password.service';
import { toast } from 'sonner';
import { AddAgentPasswordSheet } from './add-agent-password-sheet';
import { Button } from '@/components/ui/button';

export function AgentPasswordList() {
    const queryClient = useQueryClient();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<AgentPassword | null>(null);

    const { data: agents = [], isLoading } = useQuery({
        queryKey: ['agent-passwords'],
        queryFn: getAgentPasswords,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAgentPassword,
        onSuccess: () => {
            toast.success('Credential deleted');
            queryClient.invalidateQueries({ queryKey: ['agent-passwords'] });
        },
        onError: () => toast.error('Failed to delete credential')
    });

    const handleEdit = (agent: AgentPassword) => {
        setEntryToEdit(agent);
        setIsSheetOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this credential?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleCloseSheet = () => {
        setIsSheetOpen(false);
        setEntryToEdit(null);
    };

    if (isLoading) return <div className="h-24 bg-gray-50 rounded-[24px] animate-pulse" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-[24px] font-sans font-semibold text-gray-900">Agents Emails & Passwords</h2>
                <Button
                    onClick={() => setIsSheetOpen(true)}
                    className="bg-[#00B7FF]/[.08] hover:bg-[#00B7FF]/[.15] text-[#00B7FF] h-auto px-[20px] py-[10px] rounded-[10px] font-semibold transition-colors border-none shadow-none flex items-center justify-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Entry
                </Button>
            </div>

            <div className="bg-white border border-[#EDF1F7] rounded-[24px] overflow-hidden">
                <div className="w-full">
                    {/* Header */}
                    <div className="grid grid-cols-12 px-8 py-6 border-b border-[#EDF1F7] text-[16px] font-sans text-gray-900 font-medium">
                        <div className="col-span-1">Serial no.</div>
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Email</div>
                        <div className="col-span-3">Password</div>
                        <div className="col-span-2 text-right">Action</div>
                    </div>

                    {/* Rows */}
                    {agents.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No agent credentials found.</div>
                    ) : (
                        agents.map((agent, index) => (
                            <div key={agent.id} className="grid grid-cols-12 px-8 py-8 items-center text-[16px] font-sans text-gray-900 border-b last:border-0 border-[#EDF1F7] hover:bg-gray-50/50 transition-colors">
                                <div className="col-span-1 text-gray-900">{String(index + 1).padStart(2, '0')}</div>
                                <div className="col-span-3 font-medium flex items-center gap-3">
                                    {/* Optional: Show avatar if available in agent object */}
                                    {agent.agent?.photoUrl && (
                                        <img src={agent.agent.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                    )}
                                    {agent.agent?.name || 'Unknown Agent'}
                                </div>
                                <div className="col-span-3">
                                    <a href={`mailto:${agent.email}`} className="text-[#00AAFF] hover:underline">
                                        {agent.email}
                                    </a>
                                </div>
                                <div className="col-span-3 font-medium">{agent.password}</div>
                                <div className="col-span-2 flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => handleEdit(agent)}
                                        className="p-2 rounded-lg hover:bg-blue-50 text-[#00AAFF] transition-colors"
                                    >
                                        <Pencil className="h-[18px] w-[18px]" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(agent.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-[18px] w-[18px]" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <AddAgentPasswordSheet
                isOpen={isSheetOpen}
                onClose={handleCloseSheet}
                entryToEdit={entryToEdit}
            />
        </div>
    );
}
