import { useState } from 'react';
import { toast } from 'sonner';

export const useUpload = () => {
    const [isUploading, setIsUploading] = useState(false);

    const uploadFile = async (file: File): Promise<string | null> => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('accessToken='))
                ?.split('=')[1];

            const isProd = process.env.NODE_ENV === 'production';
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (isProd ? 'https://mateluxy-backend-5p27.onrender.com' : 'http://localhost:3001');
            const response = await fetch(`${apiUrl}/upload`, {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload file');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadFile, isUploading };
};
