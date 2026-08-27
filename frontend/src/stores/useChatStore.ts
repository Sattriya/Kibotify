import type { Message, User } from "./types";
import axiosInstance from "../lib/axios";
import { create } from "zustand"
import { io } from "socket.io-client"

interface ChatStore {
    users: User[];
    isLoading: boolean;
    error: string | null;
    socket: any;
    isConnected: boolean;
    onlineUsers: Set<string>;
    userActivities: Map<string, string>;
    messages: Message[];
    selectedUser: User | null;

    fetchAllUsers: () => Promise<void>;
    initSocket: (userId: string) => void;
    disconnectSocket: () => void;
    sendMessage: (senderId: string, receiverId: string, content: string) => void;
    fetchMessages: (userId: string) => Promise<void>;
    setSelectedUser: (user: User | null) => void
}

// menentukan URL server socket berdasarkan environment
const baseUrl = import.meta.env.MODE == "development" ? "http://localhost:3000" : "/"

// membuat koneksi socket, tetapi tidak langsung dijalankan
const socket = io(baseUrl, {
    autoConnect: false,
    withCredentials: true
})

export const useChatStore = create<ChatStore>((set, get) => ({
    users: [],
    isLoading: false,
    error: null,
    socket: socket,
    isConnected: false,
    onlineUsers: new Set(),
    userActivities: new Map(),
    messages: [],
    selectedUser: null,

    // function untuk mendapatkan data semua users, melalui Fetch API dengan axios 
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
    },

    // function untuk menginisialisai Socket.io


    initSocket: (userId) => {
        // jika user belum terkoneksi dengan socket maka akan menjalankan hal-hal
        if (!get().isConnected) {
            // disini user saat ini akan di hubungkan dengan server socket
            socket.auth = { userId }
            socket.connect()
            socket.emit('user_connected', userId)
            // mengirim userId ke server sebagai identitas user yang terkoneksi

            // menerima data siapa saja user yang online
            socket.on('users_online', (users: string[]) => {
                set({ onlineUsers: new Set(users) })
            })

            // menerima aktivitas yang sedang dilakukan oleh user lain (misal mendengarkan lagu: "Seandainya")
            socket.on('activities', (activities: [string, string][]) => {
                set({ userActivities: new Map(activities) })
            })

            // menambahkan user ke daftar online ketika user tersebut terhubung
            socket.on('user_connected', (userId: string) => {
                set((state) => ({
                    onlineUsers: new Set([...state.onlineUsers, userId])
                }))
            })

            // function ini memberitah ke server socket bahwa user saat ini sudah offline, yang akan diberitahukan ke semua user
            socket.on('user_disconnected', (userId: string) => {
                set((state) => {
                    const newOnlineUsers = new Set(state.onlineUsers)
                    newOnlineUsers.delete(userId)
                    return ({ onlineUsers: newOnlineUsers })
                })
            })

            // menerima pesan dari user lain
            socket.on('receive_message', (message: Message) => {
                set((state) => ({
                    messages: [...state.messages, message]
                }))
            })

            // menerima pesan yang berhasil dikirim oleh user saat ini
            socket.on('message_sent', (message: Message) => {
                set((state) => ({
                    messages: [...state.messages, message]
                }))
            })

            // memperbarui aktivitas user ketika aktivitasnya berubah
            socket.on('activity_updated', ({ userId, activity }) => {
                set((state) => {
                    const newUserActivities = new Map(state.userActivities)
                    newUserActivities.set(userId, activity)
                    return ({ userActivities: newUserActivities })
                })
            })

            // menandai bahwa socket sudah berhasil diinisialisasi
            set({ isConnected: true })
        }
    },

    // function untuk memutuskan koneksi Socket.io
    disconnectSocket: () => {
        if (get().isConnected) {
            socket.disconnect()
            set({ isConnected: false })
        }
    },

    // function untuk mengirim pesan melalui Socket.io
    sendMessage: (senderId, receiverId, content) => {
        const socket = get().socket
        if (!socket) return

        socket.emit('send_message', { senderId, receiverId, content })
    },

    // function untuk mendapatkan riwayat pesan dengan user tertentu (berdasarkan userId)
    fetchMessages: async (userId) => {
        set({ isLoading: true, error: null })

        try {
            const response = await axiosInstance.get(`/users/messages/${userId}`)
            set({ messages: response.data })
        } catch (error: any) {
            set({ error: error.response.data.message })
        } finally {
            set({ isLoading: false })
        }
    },

    // function untuk menentukan user yang sedang dipilih untuk melakukan chat
    setSelectedUser: (user) => set({ selectedUser: user })
}))