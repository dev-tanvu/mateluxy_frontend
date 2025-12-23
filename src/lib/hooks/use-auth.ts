import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuthStore } from '../store/auth-store';
import { useRouter } from 'next/navigation';

export const useMe = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const { data } = await api.get('/users/me');
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useLogin = () => {
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: async (credentials: any) => {
            const { data } = await api.post('/auth/login', credentials);
            return data;
        },
        onSuccess: (data) => {
            setUser(data.user);
            // Set a cookie on the frontend domain so middleware can detect auth
            // Cookies from backend domain aren't visible to Next.js middleware
            const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
            const cookieOptions = isProduction 
                ? 'path=/; max-age=604800; secure; samesite=none' 
                : 'path=/; max-age=604800; samesite=lax';
            document.cookie = `isAuthenticated=true; ${cookieOptions}`;
            // Use window.location.href for full page reload to ensure cookies are sent
            window.location.href = '/dashboard';
        },
    });
};

export const useLogout = () => {
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();

    return useMutation({
        mutationFn: async () => {
            await api.post('/auth/logout');
        },
        onSuccess: () => {
            logout();
            // Clear the authentication cookie
            document.cookie = 'isAuthenticated=; path=/; max-age=0';
            router.push('/login');
        },
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: async (usernameOrEmail: string) => {
            const { data } = await api.post('/auth/forgot-password', { usernameOrEmail });
            return data;
        },
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: async (payload: { usernameOrEmail: string; otp: string; newPassword: string }) => {
            const { data } = await api.post('/auth/reset-password', payload);
            return data;
        },
    });
};
