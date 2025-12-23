import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAmenities, createAmenity, deleteAmenity, CreateAmenityData, Amenity } from '@/services/amenities.service';

// Query key
export const amenitiesKeys = {
    all: ['amenities'] as const,
};

// Get all amenities
export const useAmenities = () => {
    return useQuery({
        queryKey: amenitiesKeys.all,
        queryFn: getAmenities,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Create amenity mutation
export const useCreateAmenity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAmenity,
        onSuccess: (newAmenity) => {
            // Update cache with new amenity
            queryClient.setQueryData<Amenity[]>(amenitiesKeys.all, (oldData) => {
                if (!oldData) return [newAmenity];
                return [...oldData, newAmenity].sort((a, b) => a.name.localeCompare(b.name));
            });
        },
    });
};

// Delete amenity mutation
export const useDeleteAmenity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAmenity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: amenitiesKeys.all });
        },
    });
};
