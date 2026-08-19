import express from "express"
import dotenv from "dotenv"
import connectDB from "./lib/db.js"
import { clerkMiddleware, getAuth } from '@clerk/express'
import fileUpload from 'express-fileupload'
import path from 'path'
import cors from 'cors'
import cron from 'node-cron'
import fs from 'fs'

import userRoutes from './routes/user.route.js'
import adminRoutes from './routes/admin.route.js'
import authRoutes from './routes/auth.route.js'
import songsRoutes from './routes/song.route.js'
import albumsRoutes from './routes/album.route.js'
import statsRoutes from './routes/stats.route.js'
import { createServer } from "http"
import { initializeSocket } from "./lib/socket.js"

dotenv.config()

const __dirname = path.resolve()
const app = express()
const PORT = process.env.PORT || 3000

const httpServer = createServer(app)
initializeSocket(httpServer)

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))

app.use(express.json())
app.use(clerkMiddleware())
app.use(fileUpload({ useTempFiles: true, tempFileDir: path.join(__dirname, 'temp'), createParentPath: true, limits: { fileSize: 10 * 1024 * 1024 } }))

const tempDir = path.join(process.cwd(), "tmp")
cron.schedule('0 * * * *', () => {
    if (fs.existsSync(tempDir)) {
        fs.readdir(tempDir, (err, files) => {
            if (err) {
                console.log(err)
                return
            }
            for (const file of files) {
                fs.unlink(path.join(tempDir, file), (err) => { })
            }
        })
    }
})

app.get("/api/test", (req, res) => res.json({message: "Backend terbaca"}))
app.use("/api/users", userRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/songs", songsRoutes)
app.use("/api/albums", albumsRoutes)
app.use("/api/stats", statsRoutes)

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"))
    })
}

app.use((err, req, res, next) => {
    res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message })
})

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDB()
})