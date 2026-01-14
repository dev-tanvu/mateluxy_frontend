'use client';

import React from 'react';
import Image from 'next/image';
import { Edit, Trash2, User, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Agent } from '@/lib/services/agent.service';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActivateAgent, useDeactivateAgent, useSubmitForVerification } from '@/lib/hooks/use-agents';
import { toast } from 'sonner';

interface AgentCardProps {
    agent: Agent;
    onEdit: (agent: Agent) => void;
    onDelete: (agent: Agent) => void;
}

export function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
    const { mutate: activateAgent } = useActivateAgent();
    const { mutate: deactivateAgent } = useDeactivateAgent();
    const { mutate: submitForVerification } = useSubmitForVerification();
    const router = useRouter();

    const handleStatusChange = () => {
        if (agent.isActive) {
            deactivateAgent(agent.id, {
                onSuccess: () => toast.success('Agent deactivated successfully'),
                onError: () => toast.error('Failed to deactivate agent')
            });
        } else {
            activateAgent(agent.id, {
                onSuccess: () => toast.success('Agent activated successfully'),
                onError: () => toast.error('Failed to activate agent')
            });
        }
    };

    const [imgError, setImgError] = React.useState(false);

    return (
        <div
            className="relative bg-white rounded-[30px] overflow-hidden border border-[#EDF1F7] w-[260px] cursor-pointer hover:shadow-md transition-all duration-300"
            onClick={() => router.push(`/agents/${agent.id}`)}
        >
            {/* Profile Image Section */}
            <div className="relative ml-[8px] mr-[8px] mt-[8px] rounded-[26px] h-[240px] overflow-hidden">
                {agent.photoUrl ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={agent.photoUrl}
                            alt={agent.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={() => setImgError(true)}
                            unoptimized={imgError}
                        />
                    </div>
                ) : (
                    <div className="w-full h-full bg-gradient-to-b from-[#E8F5E9] to-[#F1F8E9] flex items-center justify-center">
                        <User className="h-20 w-20 text-gray-300" />
                    </div>
                )}
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-medium ${agent.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {agent.isActive ? 'Active' : 'Inactive'}
                </div>
            </div>

            {/* Info Section */}
            <div className="px-5 pt-5 font-montserrat">
                {/* Name and Score Badge */}
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[18px] font-semibold text-black flex-1 truncate">
                        {agent.name}
                    </h3>
                    {/* Score Badge */}
                    <div className="relative w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <defs>
                                <linearGradient id={`scoreGradient-${agent.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#029DFE" />
                                    <stop offset="100%" stopColor="#00FFA6" />
                                </linearGradient>
                            </defs>
                            {/* Track */}
                            <path
                                className="text-[#E7F9F7]"
                                d="M18 4 a 14 14 0 0 1 0 28 a 14 14 0 0 1 0 -28"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                            {/* Progress - 80% */}
                            <path
                                stroke={`url(#scoreGradient-${agent.id})`}
                                strokeDasharray="80, 100"
                                d="M18 4 a 14 14 0 0 1 0 28 a 14 14 0 0 1 0 -28"
                                fill="none"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute text-[9px] font-bold text-[#1A1A1A]">
                            80
                        </span>
                    </div>
                </div>

                {/* Position | Department */}
                <div className="flex items-center gap-1 text-sm mb-3">
                    <span className="font-medium text-[12px] text-[#888888] truncate max-w-[100px]">{agent.position}</span>
                    <span className="text-gray-400">|</span>
                    <span className="font-normal text-[12px] text-[#999999] truncate max-w-[80px]">{agent.department}</span>
                </div>

                <div className="flex justify-between items-center gap-2 mb-3">
                    {/* Languages */}
                    <div className='flex items-center gap-2 overflow-hidden'>
                        {agent.languages?.slice(0, 2).map((lang, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-full border border-gray-100 whitespace-nowrap"
                            >
                                {lang}
                            </span>
                        ))}
                    </div>
                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(agent);
                            }}
                            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                            aria-label="Edit agent"
                        >
                            <Edit className="h-4 w-4 text-[#00B7FF]" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(agent);
                            }}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors"
                            aria-label="Delete agent"
                        >
                            <Trash2 className="h-4 w-4 text-[#FF3B30]" />
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="p-1.5 hover:bg-gray-50 rounded transition-colors outline-none"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4 text-gray-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleStatusChange}>
                                    {agent.isActive ? (
                                        <>
                                            <XCircle className="mr-2 h-4 w-4 text-orange-500" />
                                            <span>Deactivate</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                            <span>Activate</span>
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    submitForVerification(agent.id, {
                                        onSuccess: () => toast.success('Verification submitted successfully'),
                                        onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to submit verification')
                                    });
                                }}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                                    <span>Submit Verification</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                {/* Verification Status */}
                {agent.pfVerificationStatus && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="text-gray-500">Verification:</span>
                        <span className={`font-medium px-2 py-0.5 rounded-full ${agent.pfVerificationStatus === 'approved' ? 'bg-green-100 text-green-700' :
                            agent.pfVerificationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                            {agent.pfVerificationStatus.charAt(0).toUpperCase() + agent.pfVerificationStatus.slice(1)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
