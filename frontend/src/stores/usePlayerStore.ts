import type { Song } from './types'
import { create } from 'zustand'
import { useChatStore } from './useChatStore'

interface PlayerStore {
    currentSong: Song | null,
    isPlaying: boolean,
    queue: Song[],
    currentIndex: number,

    initializeQueue: (songs: Song[]) => void,
    playAlbum: (songs: Song[], startIndex?: number) => void,
    setCurrentSong: (song: Song | null) => void,
    tooglePlay: () => void,
    playNext: () => void,
    playPrevious: () => void,
    updateActivity: (song?: Song) => void
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
    currentSong: null,
    isPlaying: false,
    queue: [],
    currentIndex: -1,

    updateActivity: (song) => {
        const socket = useChatStore.getState().socket
        if (socket.auth?.userId) {
            if (socket) {
                socket.emit('update_activity', {
                    userId: socket.auth?.userId,
                    activity: song ? `Playing ${song.title} by ${song.artist}` : 'Idle'
                })
            }
        }
    },

    initializeQueue: (songs) => {
        set({
            queue: songs,
            currentSong: get().currentSong || songs[0],
            currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex
        })
    },

    playAlbum: (songs, startIndex = 0) => {
        if (songs.length === 0) return

        const song = songs[startIndex]

        get().updateActivity(song)

        set({
            queue: songs,
            isPlaying: true,
            currentSong: song,
            currentIndex: startIndex
        })
    },

    setCurrentSong: (song: Song | null) => {
        if (!song) return

        get().updateActivity(song)

        const songIndex = get().queue.findIndex(s => s._id == song._id)
        set({
            isPlaying: true,
            currentSong: song,
            currentIndex: songIndex !== -1 ? songIndex : get().currentIndex
        })
    },

    tooglePlay: () => {
        const willStartPlaying = !get().isPlaying
        const currentSong = get().currentSong

        const socket = useChatStore.getState().socket

        if (socket.auth?.userId) {
            if (socket) {
                socket.emit('update_activity', {
                    userId: socket.auth.userId,
                    activity: willStartPlaying && currentSong ? `Playing ${currentSong.title} by ${currentSong.artist}` : 'Idle'
                })
            }
        }

        set({ isPlaying: willStartPlaying })
    },

    playNext: () => {
        const { currentIndex, queue } = get()
        const nextIndex = currentIndex + 1

        if (nextIndex < queue.length) {
            const nextSong = queue[nextIndex]
            get().updateActivity(nextSong)
            set({
                isPlaying: true,
                currentSong: nextSong,
                currentIndex: nextIndex
            })
        } else {
            set({ isPlaying: false })
            get().updateActivity()
        }
    },
    playPrevious: () => {
        const { currentIndex, queue } = get()
        const prevIndex = currentIndex + 1

        if (prevIndex >= 0) {
            const prevSong = queue[prevIndex]
            get().updateActivity(prevSong)
            set({
                isPlaying: true,
                currentSong: prevSong,
                currentIndex: prevIndex
            })
        } else {
            set({ isPlaying: false })
            get().updateActivity()
        }
    },
}))