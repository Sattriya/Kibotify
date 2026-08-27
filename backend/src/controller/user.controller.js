import { getAuth } from "@clerk/express";
import { User } from "../models/user.model.js"
import { Message } from "../models/message.model.js";

// function untuk mendapatkan data semua user
export const getAllUsers = async (req, res, next) => {
    try {
        const currentUserId = getAuth(req).userId
        const users = await User.find({ clerkId: { $ne: currentUserId } })

        res.status(200).json(users)
    } catch (error) {
        next(error)
    }
}

// function untuk mendapatkan data pesan dari user lain
export const getMessages = async (req, res, next) => {
    try {
        const myId = getAuth(req).userId
        const { userId } = req.params

        const messages = await Message.find({
            $or: [
                { receiverId: myId, senderId: userId },
                { receiverId: userId, senderId: myId }
            ]
        }).sort({ createdAt: 1 })

        res.status(200).json(messages)
    } catch (error) {
        next(error)
    }
}