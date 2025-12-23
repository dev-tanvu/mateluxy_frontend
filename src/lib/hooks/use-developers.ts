import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { developerService, CreateDeveloperDto } from '../services/developer.service';

export const useDevelopers = (search?: string) => {
    return useQuery({
        queryKey: ['developers', search],
        queryFn: () => developerService.getAll(search),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useDeveloper = (id: string) => {
    return useQuery({
        queryKey: ['developer', id],
        queryFn: () => developerService.getOne(id),
        enabled: !!id,
    });
};

export const useCreateDeveloper = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateDeveloperDto) => developerService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['developers'] });
        },
    });
};

export const useUpdateDeveloper = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateDeveloperDto> }) => developerService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['developers'] });
        },
    });
};

export const useDeleteDeveloper = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => developerService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['developers'] });
        },
    });
};
