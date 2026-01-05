'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sheet } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Search, User, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAgentPassword, updateAgentPassword, AgentPassword } from '@/services/agent-password.service';
import { toast } from 'sonner';
import { useAgents } from '@/lib/hooks/use-agents';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const schema = z.object({
    agentId: z.string().min(1, 'Agent is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

interface AddAgentPasswordSheetProps {
    isOpen: boolean;
    onClose: () => void;
    entryToEdit?: AgentPassword | null;
}

export function AddAgentPasswordSheet({ isOpen, onClose, entryToEdit }: AddAgentPasswordSheetProps) {
    const queryClient = useQueryClient();
    const [agentSearchTerm, setAgentSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Use the custom hook for consistency and caching
    const { data: agents = [] } = useAgents();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const selectedAgentId = watch('agentId');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        if (isOpen) {
            if (entryToEdit) {
                setValue('agentId', entryToEdit.agentId);
                setValue('email', entryToEdit.email);
                setValue('password', entryToEdit.password);
            } else {
                reset({
                    agentId: '',
                    email: '',
                    password: '',
                });
            }
            setAgentSearchTerm('');
            setShowDropdown(false);
        }
    }, [isOpen, entryToEdit, reset, setValue]);

    const mutation = useMutation({
        mutationFn: (data: FormValues) => {
            if (entryToEdit) {
                return updateAgentPassword(entryToEdit.id, data);
            }
            return createAgentPassword(data);
        },
        onSuccess: () => {
            toast.success(entryToEdit ? 'Agent credentials updated' : 'Agent credentials created');
            queryClient.invalidateQueries({ queryKey: ['agent-passwords'] });
            handleClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to save credentials');
        }
    });

    const handleClose = () => {
        reset();
        setAgentSearchTerm('');
        setShowDropdown(false);
        onClose();
    };

    const onSubmit = (data: FormValues) => {
        mutation.mutate(data);
    };

    const selectedAgent = useMemo(() =>
        agents.find((a: any) => a.id === selectedAgentId),
        [agents, selectedAgentId]);

    // Filter agents based on search term
    const filteredAgents = useMemo(() => {
        if (!agentSearchTerm.trim()) return agents;
        return agents.filter((agent: any) =>
            agent.name.toLowerCase().includes(agentSearchTerm.toLowerCase())
        );
    }, [agents, agentSearchTerm]);

    const handleSelectAgent = (agentId: string) => {
        setValue('agentId', agentId);
        setAgentSearchTerm('');
        setShowDropdown(false);
    };

    const handleClearSelection = () => {
        setValue('agentId', '');
        setAgentSearchTerm('');
        inputRef.current?.focus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAgentSearchTerm(e.target.value);
        setShowDropdown(true);
    };

    const handleInputFocus = () => {
        if (!selectedAgentId) {
            setShowDropdown(true);
        }
    };

    return (
        <Sheet isOpen={isOpen} onClose={handleClose} title={entryToEdit ? "Edit Agent Password" : "Add Agent Password"} titleClassName="font-sans font-semibold text-[24px]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Agent Selection - Autocomplete style */}
                <div className="space-y-3">
                    <Label className="text-[16px] font-medium text-[#1A1A1A]">Select Agent</Label>

                    <div className="relative" ref={dropdownRef}>
                        {/* Selected Agent Display OR Search Input */}
                        {selectedAgent ? (
                            <div className="flex items-center justify-between h-[50px] bg-white border border-[#EDF1F7] rounded-xl px-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={selectedAgent.photoUrl} alt={selectedAgent.name} />
                                        <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
                                            {selectedAgent.name?.charAt(0) || <User className="h-4 w-4" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-[15px] font-medium text-[#1A1A1A]">{selectedAgent.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClearSelection}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-400" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search for agent"
                                    value={agentSearchTerm}
                                    onChange={handleInputChange}
                                    onFocus={handleInputFocus}
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-xl text-[15px] pr-10"
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                        )}

                        {/* Dropdown Agent List */}
                        {showDropdown && !selectedAgentId && (
                            <div className="absolute top-full left-0 right-0 mt-1 border border-[#EDF1F7] rounded-xl max-h-[280px] overflow-y-auto bg-white shadow-lg z-[100]">
                                {filteredAgents.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-400">No agents found</div>
                                ) : (
                                    filteredAgents.map((agent: any) => {
                                        const languageText = agent.languages && agent.languages.length > 0
                                            ? `Speaks ${agent.languages.slice(0, 2).join(', ')}`
                                            : 'Languages not set';

                                        return (
                                            <div
                                                key={agent.id}
                                                onClick={() => handleSelectAgent(agent.id)}
                                                className="flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-[#EDF1F7] last:border-b-0 hover:bg-gray-50"
                                            >
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={agent.photoUrl} alt={agent.name} />
                                                    <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
                                                        {agent.name?.charAt(0) || <User className="h-4 w-4" />}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-[15px] font-medium leading-tight text-[#1A1A1A]">
                                                        {agent.name}
                                                    </span>
                                                    <span className="text-[13px] text-[#8F9BB3]">
                                                        {languageText}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                    {errors.agentId && <p className="text-xs text-red-500">{errors.agentId.message}</p>}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="agent@example.com"
                        className="h-[50px] bg-white border-gray-200"
                        {...register('email')}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                    <Input
                        id="password"
                        type="text"
                        placeholder="Enter password"
                        className="h-[50px] bg-white border-gray-200"
                        {...register('password')}
                    />
                    {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div className="pt-4 flex justify-center">
                    <Button
                        type="submit"
                        className="bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD] h-12 px-8 text-base font-medium rounded-lg w-auto min-w-[200px]"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                        {entryToEdit ? 'Update Credentials' : 'Add Credentials'}
                    </Button>
                </div>
            </form>
        </Sheet>
    );
}
