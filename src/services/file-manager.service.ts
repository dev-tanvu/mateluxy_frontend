import api from '@/lib/api/axios';

export const fileManagerService = {
    getContents: async (folderId?: string) => {
        const params = folderId ? { folderId } : {};
        const response = await api.get('/file-manager/contents', {
            params,
        });
        return response.data;
    },

    createFolder: async (name: string, parentId?: string) => {
        const response = await api.post('/file-manager/folder', {
            name,
            parentId,
        });
        return response.data;
    },

    uploadFile: async (file: File, folderId?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        if (folderId) formData.append('folderId', folderId);

        const response = await api.post('/file-manager/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteFolder: async (id: string) => {
        const response = await api.delete(`/file-manager/folder/${id}`);
        return response.data;
    },

    deleteFile: async (id: string) => {
        const response = await api.delete(`/file-manager/file/${id}`);
        return response.data;
    },
};
