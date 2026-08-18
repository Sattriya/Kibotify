import { Server } from 'socket.io'
import { Message } from '../models/message.model.js'

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true
        }
    })

    const userSockets = new Map()
    const userActivity = new Map()

    io.on('connection', (socket) => {
        socket.on('user_connected', (userId) => {
            userSockets.set(userId, socket.id)
            userActivity.set(userId, "Idle")

            io.emit('user_connected', userId)

            socket.emit('users_online', Array.from(userSockets.keys()))

            io.emit('activities', Array.from(userActivity.entries()))
        })

        socket.on('update_activity', ({ userId, activity }) => {
            console.log('UserID and Activity: ', userId, activity)
            userActivity.set(userId, activity)
            io.emit('activity_updated', { userId, activity })
        })

        socket.on('send_message', async (data) => {
            const { senderId, receiverId, content } = data

            try {
                const message = await Message.create({
                    senderId,
                    receiverId,
                    content
                })

                const receiverSocketId = userSockets.get(receiverId)
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_message', message)
                }

                socket.emit('message_sent', message)
            } catch (error) {
                console.log('Error when sending message', error)
                socket.emit('message_error', error.message)
            }
        })

        socket.on('disconnect', () => {
            let disconnectedUserId
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId
                    userSockets.delete(disconnectedUserId)
                    userActivity.delete(disconnectedUserId)
                    break
                }

                if (disconnectedUserId) {
                    io.emit('user_disconnect', disconnectedUserId)
                }
            }
        })
    })

}