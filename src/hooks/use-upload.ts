import { useState } from 'react';
import { toast } from 'sonner';
import { API_URL } from '@/lib/api-config';

export const useUpload = () => {
    const [isUploading, setIsUploading] = useState(false);

    const uploadFile = async (file: File): Promise<string | null> => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const apiUrl = API_URL;
            const response = await fetch(`${apiUrl}/upload`, {
                method: 'POST',
                credentials: 'include', // Send cookies
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
