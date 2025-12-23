import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService, CreateAgentDto } from '../services/agent.service';

import { keepPreviousData } from '@tanstack/react-query';

export const useAgents = (search?: string) => {
    return useQuery({
        queryKey: ['agents', search],
        queryFn: () => agentService.getAll(search),
        placeholderData: keepPreviousData,
    });
};

export const useAgent = (id: string) => {
    return useQuery({
        queryKey: ['agent', id],
        queryFn: () => agentService.getOne(id),
        enabled: !!id,
    });
};

export const useAgentsByArea = (area: string | null) => {
    return useQuery({
        queryKey: ['agents', 'by-area', area],
        queryFn: () => area ? agentService.getByArea(area) : Promise.resolve([]),
        enabled: !!area,
    });
};

export const useCreateAgent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAgentDto) => agentService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
        },
    });
};

export const useUpdateAgent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateAgentDto> }) => agentService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
        },
    });
};

export const useDeleteAgent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => agentService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
        },
    });
};

export const useActivateAgent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => agentService.activate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
        },
    });
};

export const useDeactivateAgent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => agentService.deactivate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
        },
    });
};

export const useSubmitForVerification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => agentService.submitForVerification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
        },
    });
};
