import axiosInstance from "../lib/axios";
import { create } from "zustand"

interface ChatStore {
    users: any[];
    fetchAllUsers: () => Promise<void>;
    isLoading: boolean;
    error: string | null
}

export const useChatStore = create<ChatStore>((set) => ({
    users: [],
    isLoading: false,
    error: null,
    fetchAllUsers: async () => {
        set({ isLoading: true })
        try {
            const response = await axiosInstance.get('/users')
            set({ users: response.data })
        } catch (error: any) {
            set({ error: error.response.data.message })
        } finally {
            set({ isLoading: false })
        }
    }
}))