import { Song } from "../models/song.model.js" 

// function untuk mengambil semua lagu dari database dan mengurutkannya berdasarkan lagu yang paling baru dibuat
export const getAllSongs = async (req, res, next) => { 
    try { 
        const songs = await Song.find().sort({ createdAt: -1 }) 
        res.status(200).json(songs) 
    } catch (error) { 
        next(error) 
    } 
} 
 
// function untuk mengambil 6 lagu secara acak dari database dan mengembalikan data sebagai featured songs
// todo: menggunakan Machine learning
export const getFeaturedSongs = async (req, res, next) => { 
    try { 
        const songs = await Song.aggregate([ 
            { 
                $sample: { 
                    size: 6 
                } 
            }, 
            { 
                $project: { 
                    _id: 1, 
                    title: 1, 
                    artist: 1, 
                    imageUrl: 1, 
                    audioUrl: 1 
                } 
            } 
        ]) 
 
        res.json(songs) 
    } catch (error) { 
        next(error) 
    } 
} 
 
// function untuk mengambil 4 lagu secara acak dan mengembalikan data pada bagian made for you
// todo: menggunakan Machine learning
export const getMadeForYouSongs = async (req, res, next) => { 
    try { 
        const songs = await Song.aggregate([ 
            { 
                $sample: { 
                    size: 4 
                } 
            }, 
            { 
                $project: { 
                    _id: 1, 
                    title: 1, 
                    artist: 1, 
                    imageUrl: 1, 
                    audioUrl: 1 
                } 
            } 
        ]) 
 
        res.json(songs) 
    } catch (error) { 
        next(error) 
    } 
} 
 
// function untuk mengambil 4 lagu secara acak dan mengembalikan data sebagai trending songs
// todo: menggunakan Machine learning
export const getTrendingSongs = async (req, res, next) => { 
    try { 
        const songs = await Song.aggregate([ 
            { 
                $sample: { 
                    size: 4 
                } 
            }, 
            { 
                $project: { 
                    _id: 1, 
                    title: 1, 
                    artist: 1, 
                    imageUrl: 1, 
                    audioUrl: 1 
                } 
            } 
        ]) 
 
        res.json(songs) 
    } catch (error) { 
        next(error) 
    } 
}