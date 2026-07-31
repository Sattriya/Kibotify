export interface Song {
    _id: string;
    title: string;
    artist: string;
    albumId: string | null;
    audioUrl: string;
    imageUrl: string;
    duration: number;
    createdAt: string;
    updatedAt: string;
}

export interface Album {
    _id: string;
    title: string;
    artist: string;
    imageUrl: string;
    releaseYear: string;
    songs: Song[]
}