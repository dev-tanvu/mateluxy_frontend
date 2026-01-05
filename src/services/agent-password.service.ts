
import api from '@/lib/api/axios';

export interface AgentPassword {
    id: string;
    agentId: string;
    email: string;
    password: string; // Decrypted
    agent: {
        id: string;
        name: string;
        photoUrl?: string;
    };
    createdAt: string;
}

export interface CreateAgentPasswordDto {
    agentId: string;
    email: string;
    password: string;
}

export interface UpdateAgentPasswordDto extends Partial<CreateAgentPasswordDto> { }

export const getAgentPasswords = async (): Promise<AgentPassword[]> => {
    const response = await api.get('/agent-passwords');
    return response.data;
};

export const createAgentPassword = async (data: CreateAgentPasswordDto): Promise<AgentPassword> => {
    const response = await api.post('/agent-passwords', data);
    return response.data;
};

export const updateAgentPassword = async (id: string, data: UpdateAgentPasswordDto): Promise<AgentPassword> => {
    const response = await api.patch(`/agent-passwords/${id}`, data);
    return response.data;
};

export const deleteAgentPassword = async (id: string): Promise<void> => {
    await api.delete(`/agent-passwords/${id}`);
};
