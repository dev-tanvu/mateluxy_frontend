import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProperties, getProperty, createProperty, updateProperty, deleteProperty, CreatePropertyData, Property } from '@/services/property.service';
import { useRouter } from 'next/navigation';

export const propertiesKeys = {
    all: ['properties'] as const,
    detail: (id: string) => ['properties', id] as const,
};

import { keepPreviousData } from '@tanstack/react-query';

export const useProperties = () => {
    return useQuery({
        queryKey: propertiesKeys.all,
        queryFn: () => getProperties(),
        placeholderData: keepPreviousData,
    });
};

export const useProperty = (id: string) => {
    return useQuery({
        queryKey: propertiesKeys.detail(id),
        queryFn: () => getProperty(id),
        enabled: !!id,
    });
};

export const useCreateProperty = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: createProperty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: propertiesKeys.all });
            // Navigate to properties list or dashboard
            router.push('/dashboard');
        },
    });
};

export const useUpdateProperty = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreatePropertyData> }) => updateProperty(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: propertiesKeys.all });
            // Navigate to properties list or back
            router.back();
        },
    });
};

export const useDeleteProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProperty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: propertiesKeys.all });
        },
    });
};
