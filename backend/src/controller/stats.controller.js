import { Album } from "../models/album.model.js"
import { Song } from "../models/song.model.js"
import { User } from "../models/user.model.js"

//function untuk mendapatkan data statistik seperti (jumlan lagu, album, artis, user)
export const getAllStats = async (req, res, next) => {
    try {
        const [totalSongs, totalAlbums, totalUsers, uniqueArtist] = await Promise.all([

            //menghitung jumlah lagu
            Song.countDocuments(),

            //menghitung jumlah album
            Album.countDocuments(),

            //menghitung jumlah user
            User.countDocuments(),

            // menghitung jumlah artis
            // aggregation digunakan untuk menghitung jumlah artist unik dari songs dan albums
            Song.aggregate([
                {
                    $unionWith: {
                        coll: "albums",
                        pipeline: []
                    }
                },
                {
                    $group: {
                        _id: "$artist"
                    }
                },
                {
                    $count: "count"
                }
            ])
        ])

        res.status(200).json({
            totalSongs,
            totalAlbums,
            totalUsers,
            totalArtists: uniqueArtist[0]?.count || 0
        })
    } catch (error) {
        next(error)
    }
}