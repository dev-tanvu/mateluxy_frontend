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

    uploadFile: async (file: File, folderId?: string, onProgress?: (progress: number) => void) => {
        const formData = new FormData();
        formData.append('file', file);
        if (folderId) formData.append('folderId', folderId);

        const response = await api.post('/file-manager/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
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

    getStats: async () => {
        const response = await api.get('/file-manager/stats');
        return response.data;
    },

    getRecent: async () => {
        const response = await api.get('/file-manager/recent');
        return response.data;
    },

    getDeleted: async () => {
        const response = await api.get('/file-manager/deleted');
        return response.data;
    },

    restoreFile: async (id: string) => {
        const response = await api.post(`/file-manager/file/${id}/restore`);
        return response.data;
    },

    restoreFolder: async (id: string) => {
        const response = await api.post(`/file-manager/folder/${id}/restore`);
        return response.data;
    },

    renameFolder: async (id: string, name: string) => {
        const response = await api.post(`/file-manager/folder/${id}/rename`, { name });
        return response.data;
    },

    renameFile: async (id: string, name: string) => {
        const response = await api.post(`/file-manager/file/${id}/rename`, { name });
        return response.data;
    },

    moveFolder: async (id: string, targetParentId: string | null) => {
        const response = await api.post(`/file-manager/folder/${id}/move`, { targetParentId });
        return response.data;
    },

    moveFile: async (id: string, targetFolderId: string | null) => {
        const response = await api.post(`/file-manager/file/${id}/move`, { targetFolderId });
        return response.data;
    },

    copyFolder: async (id: string, targetParentId: string | null) => {
        const response = await api.post(`/file-manager/folder/${id}/copy`, { targetParentId });
        return response.data;
    },

    copyFile: async (id: string, targetFolderId: string | null) => {
        const response = await api.post(`/file-manager/file/${id}/copy`, { targetFolderId });
        return response.data;
    },

    updateFolderColor: async (id: string, color: string) => {
        const response = await api.post(`/file-manager/folder/${id}/color`, { color });
        return response.data;
    },

    permanentlyDeleteFile: async (id: string) => {
        const response = await api.delete(`/file-manager/file/${id}/permanent`);
        return response.data;
    },

    permanentlyDeleteFolder: async (id: string) => {
        const response = await api.delete(`/file-manager/folder/${id}/permanent`);
        return response.data;
    },
};
