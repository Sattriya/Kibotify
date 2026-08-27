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

    // function untuk memberitahu user lain lagu yang sedang diputar
    updateActivity: (song) => {
        const socket = useChatStore.getState().socket

        // memastikan user sudah terhubung dengan socket
        if (socket.auth?.userId) {
            if (socket) {
                socket.emit('update_activity', {
                    userId: socket.auth?.userId,
                    activity: song
                        ? `Playing ${song.title} by ${song.artist}`
                        : 'Idle'
                })
            }
        }
    },

    // function untuk memasukkan daftar lagu ke dalam queue
    // jika belum ada lagu yang sedang diputar, lagu pertama akan menjadi currentSong
    initializeQueue: (songs) => {
        set({
            queue: songs,
            currentSong: get().currentSong || songs[0],
            currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex
        })
    },

    // function untuk memutar kumpulan lagu mulai dari index tertentu
    playAlbum: (songs, startIndex = 0) => {
        // tidak menjalankan function jika tidak ada lagu
        if (songs.length === 0) return

        const song = songs[startIndex]

        // mengirim aktivitas lagu yang sedang diputar ke server
        get().updateActivity(song)

        set({
            queue: songs,
            isPlaying: true,
            currentSong: song,
            currentIndex: startIndex
        })
    },

    // function untuk mengganti lagu yang sedang diputar
    setCurrentSong: (song: Song | null) => {
        if (!song) return

        // memperbarui aktivitas user
        get().updateActivity(song)

        // mencari posisi lagu di dalam queue
        const songIndex = get().queue.findIndex(s => s._id == song._id)

        set({
            isPlaying: true,
            currentSong: song,
            currentIndex: songIndex !== -1
                ? songIndex
                : get().currentIndex
        })
    },

    // function untuk menjalankan atau menghentikan lagu
    tooglePlay: () => {
        const willStartPlaying = !get().isPlaying
        const currentSong = get().currentSong

        const socket = useChatStore.getState().socket

        // mengubah aktivitas user berdasarkan status play/pause
        if (socket.auth?.userId) {
            if (socket) {
                socket.emit('update_activity', {
                    userId: socket.auth.userId,
                    activity: willStartPlaying && currentSong
                        ? `Playing ${currentSong.title} by ${currentSong.artist}`
                        : 'Idle'
                })
            }
        }

        set({ isPlaying: willStartPlaying })
    },

    // function untuk memutar lagu berikutnya di dalam queue
    playNext: () => {
        const { currentIndex, queue } = get()
        const nextIndex = currentIndex + 1

        // memastikan masih ada lagu berikutnya di dalam queue
        if (nextIndex < queue.length) {
            const nextSong = queue[nextIndex]

            get().updateActivity(nextSong)

            set({
                isPlaying: true,
                currentSong: nextSong,
                currentIndex: nextIndex
            })
        } else {
            // jika sudah sampai lagu terakhir, hentikan player
            set({ isPlaying: false })
            get().updateActivity()
        }
    },

    // function untuk memutar lagu sebelumnya di dalam queue
    playPrevious: () => {
        const { currentIndex, queue } = get()
        const prevIndex = currentIndex - 1

        // memastikan masih ada lagu sebelumnya di dalam queue
        if (prevIndex >= 0) {
            const prevSong = queue[prevIndex]

            get().updateActivity(prevSong)

            set({
                isPlaying: true,
                currentSong: prevSong,
                currentIndex: prevIndex
            })
        } else {
            // jika sudah berada di lagu pertama, hentikan player
            set({ isPlaying: false })
            get().updateActivity()
        }
    },
}))