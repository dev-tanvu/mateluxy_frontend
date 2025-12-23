import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offPlanPropertyService, CreateOffPlanPropertyDto } from '../services/off-plan-property.service';

import { keepPreviousData } from '@tanstack/react-query';

export const useOffPlanProperties = (filters?: Parameters<typeof offPlanPropertyService.getAll>[0]) => {
    return useQuery({
        queryKey: ['off-plan-properties', filters],
        queryFn: () => offPlanPropertyService.getAll(filters),
        placeholderData: keepPreviousData,
    });
};

export const useOffPlanProperty = (id: string) => {
    return useQuery({
        queryKey: ['off-plan-property', id],
        queryFn: () => offPlanPropertyService.getOne(id),
        enabled: !!id,
    });
};

export const useCreateOffPlanProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOffPlanPropertyDto) => offPlanPropertyService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['off-plan-properties'] });
        },
    });
};

export const useUpdateOffPlanProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateOffPlanPropertyDto> }) =>
            offPlanPropertyService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['off-plan-properties'] });
        },
    });
};

export const useDeleteOffPlanProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => offPlanPropertyService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['off-plan-properties'] });
        },
    });
};
