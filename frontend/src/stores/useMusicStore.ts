import type { Album, Song } from "../types"
import axiosInstance from "../lib/axios"
import { create } from "zustand"

interface MusicStore {
    songs: Song[],
    albums: Album[],
    isLoading: boolean,
    error: string | null,
    currentAlbum: Album | null,
    featuredSongs: Song[],
    madeForYouSongs: Song[],
    trendingSongs: Song[],

    fetchAlbum: () => Promise<void>,
    fetchAlbumById: (albumId: string) => Promise<void>,
    fetchFeaturedSongs: () => Promise<void>,
    fetchMadeForYouSongs: () => Promise<void>,
    fetchTrendingSongs: () => Promise<void>
}

export const useMusicStore = create<MusicStore>((set) => ({
    albums: [],
    songs: [],
    isLoading: false,
    error: null,
    currentAlbum: null,
    featuredSongs: [],
    madeForYouSongs: [],
    trendingSongs: [],

    fetchAlbum: async () => {
        set({ isLoading: true })
        try {
            const response = await axiosInstance.get('/albums')
            set({ albums: response.data })
        } catch (error: any) {
            set({ error: error?.response.data.message })
        } finally {
            set({ isLoading: false })
        }
    },

    fetchAlbumById: async (albumId) => {
        set({ isLoading: true })
        try {
            const response = await axiosInstance.get(`/albums/${albumId}`)
            set({ currentAlbum: response.data })
            set({})
        } catch (error: any) {
            set({ error: error?.response.data.message })
        } finally {
            set({ isLoading: false })
        }
    },

    fetchFeaturedSongs: async () => {
        set({ isLoading: true, error: null })
        try {
            const response = await axiosInstance.get('/songs/featured')
            set({ featuredSongs: response.data })
        } catch (error: any) {
            set({ error: error?.response.data.message })
        } finally {
            set({ isLoading: false })
        }
    },

    fetchMadeForYouSongs: async () => {
        set({ isLoading: true, error: null })
        try {
            const response = await axiosInstance.get('/songs/made-for-you')
            set({ madeForYouSongs: response.data })
        } catch (error: any) {
            set({ error: error?.response.data.message })
        } finally {
            set({ isLoading: false })
        }
    },

    fetchTrendingSongs: async () => {
        set({ isLoading: true, error: null })
        try {
            const response = await axiosInstance.get('/songs/trending')
            set({ trendingSongs: response.data })
        } catch (error: any) {
            set({ error: error?.response.data.message })
        } finally {
            set({ isLoading: false })
        }
    },

}))