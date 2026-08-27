import { Album } from "../models/album.model.js"

// function untuk mengambil semua album dari database dan mengirimkannya sebagai response JSON
export const getAllAlbums = async (req, res, next) => {
    try {
        const albums = await Album.find()
        res.status(200).json(albums)
    } catch (error) {
        next(error)
    }
}

// function untuk mengambil album berdasarkan id beserta lagu-lagu yang terdapat di dalam album tersebut
export const getAlbumById = async (req, res, next) => {
    try {
        const { albumId } = req.params

        // populate("songs") digunakan untuk mengambil data song berdasarkan reference yang terdapat pada field songs
        const album = await Album.findById(albumId).populate("songs")

        if (!album) {
            return res.status(404).json({ message: "Album not found" })
        }

        res.status(200).json(album)
    } catch (error) {
        next(error)
    }
}