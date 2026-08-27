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

// middleware untuk menangani upload file dari client
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'temp'),
    createParentPath: true,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
})) 
 

// menentukan lokasi folder temporary untuk file upload
const tempDir = path.join(process.cwd(), "tmp") 

// menghapus file temporary yang sudah tidak digunakan setiap satu jam menggunakan cron
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

// route untuk menangani request yang berhubungan dengan user
app.use("/api/users", userRoutes) 

// route untuk menangani request admin
app.use("/api/admin", adminRoutes) 

// route untuk menangani autentikasi
app.use("/api/auth", authRoutes) 

// route untuk menangani request lagu
app.use("/api/songs", songsRoutes) 

// route untuk menangani request album
app.use("/api/albums", albumsRoutes) 

// route untuk menangani request statistik
app.use("/api/stats", statsRoutes) 

if (process.env.NODE_ENV === "production") { 
    app.use(express.static(path.join(__dirname, "../frontend/dist"))) 
    app.get("*", (req, res) => { 
        res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html")) 
    }) 
} 
 
// middleware untuk menangani error yang terjadi pada server
app.use((err, req, res, next) => { 
    res.status(500).json({
        message: process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message
    }) 
}) 
 
// menjalankan HTTP server dan menghubungkan aplikasi ke database
httpServer.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`) 
    connectDB() 
})