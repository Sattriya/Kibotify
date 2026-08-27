import { Server } from 'socket.io'
import { Message } from '../models/message.model.js'

// function untuk menginisialisasi Socket.io menggunakan HTTP server
export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true
        }
    })

    // menyimpan hubungan antara userId dengan socketId user
    const userSockets = new Map()

    // menyimpan aktivitas yang sedang dilakukan setiap user
    const userActivity = new Map()

    // menjalankan logic ketika ada client yang terhubung ke Socket.io
    io.on('connection', (socket) => {

        // menangani ketika user berhasil terhubung
        socket.on('user_connected', (userId) => {
            // menyimpan socketId berdasarkan userId
            userSockets.set(userId, socket.id)

            // memberikan status awal user sebagai Idle
            userActivity.set(userId, "Idle")

            // memberitahu semua client bahwa ada user yang baru online
            io.emit('user_connected', userId)

            // mengirim daftar user yang sedang online ke user yang baru terhubung
            socket.emit('users_online', Array.from(userSockets.keys()))

            // mengirim aktivitas semua user ke seluruh client
            io.emit('activities', Array.from(userActivity.entries()))
        })

        // menangani perubahan aktivitas user
        socket.on('update_activity', ({ userId, activity }) => {
            // memperbarui aktivitas user
            userActivity.set(userId, activity)

            // memberitahu semua client tentang aktivitas terbaru
            io.emit('activity_updated', { userId, activity })
        })

        // menangani pengiriman pesan antar user
        socket.on('send_message', async (data) => {
            const { senderId, receiverId, content } = data

            try {
                // menyimpan pesan ke database
                const message = await Message.create({
                    senderId,
                    receiverId,
                    content
                })

                // mencari socketId milik user penerima
                const receiverSocketId = userSockets.get(receiverId)

                // mengirim pesan ke user penerima jika sedang online
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_message', message)
                }

                // mengirim kembali pesan ke pengirim
                socket.emit('message_sent', message)

            } catch (error) {
                console.log('Error when sending message', error)

                // memberitahu pengirim jika terjadi error saat mengirim pesan
                socket.emit('message_error', error.message)
            }
        })

        // menangani ketika user terputus dari Socket.io
        socket.on('disconnect', () => {
            let disconnectedUserId

            // mencari user berdasarkan socketId yang terputus
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId

                    // menghapus user dari daftar user yang online
                    userSockets.delete(disconnectedUserId)

                    // menghapus aktivitas user
                    userActivity.delete(disconnectedUserId)

                    break
                }

                if (disconnectedUserId) {
                    // memberitahu semua client bahwa user sudah offline
                    io.emit('user_disconnect', disconnectedUserId)
                }
            }
        })
    })
}