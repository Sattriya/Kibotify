import { Button } from "../../../components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import axiosInstance from "../../../lib/axios"
import { Plus, Upload } from "lucide-react"
import { useRef, useState } from "react"
import toast from "react-hot-toast"

const AddAlbumDialog = () => {
    // state untuk mengatur apakah dialog sedang terbuka
    const [isAlbumDialogOpen, setIsAlbumDialogOpen] = useState(false)

    // state untuk mengatur loading saat proses membuat album
    const [isLoading, setIsLoading] = useState(false)

    // ref untuk mengakses input file dari button Choose File
    const fileInputRef = useRef<HTMLInputElement>(null)

    // state untuk menyimpan data album yang akan dibuat
    const [newAlbum, setNewAlbum] = useState({
        title: "",
        artist: "",
        releaseYear: new Date().getFullYear()
    })

    // state untuk menyimpan file gambar album
    const [imageFile, setImageFile] = useState<File | null>(null)

    // function untuk mengambil file gambar yang dipilih oleh user
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if (file) {
            setImageFile(file)
        }
    }

    // function untuk mengirim data album ke server
    const handleSubmit = async () => {
        setIsLoading(true)

        try {
            // memastikan user sudah memilih gambar album
            if (!imageFile) {
                toast.error('Please upload an image')
                return
            }

            // menggunakan FormData karena data yang dikirim juga berupa file
            const formData = new FormData()
            formData.append('title', newAlbum.title)
            formData.append('artist', newAlbum.artist)
            formData.append('releaseYear', newAlbum.releaseYear.toString())

            if (imageFile) {
                formData.append('imageFile', imageFile)
            }

            // mengirim data album ke API
            await axiosInstance.post('/admin/albums', formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })

            // mengembalikan form ke kondisi awal setelah berhasil
            setNewAlbum({
                title: "",
                artist: "",
                releaseYear: new Date().getFullYear()
            })

            setImageFile(null)

            // menutup dialog setelah album berhasil dibuat
            setIsAlbumDialogOpen(false)

            toast.success("Succesfuly created new album")

        } catch (error: any) {
            toast.error('Error creating album: ' + error?.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isAlbumDialogOpen} onOpenChange={setIsAlbumDialogOpen}>
            <DialogTrigger>
                <div className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 rounded-lg hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer'>
                    Add Album
                    <Plus className='mr-2 h-4 w-4' />
                </div>
            </DialogTrigger>

            <DialogContent className='bg-zinc-900 border-zinc-700'>
                <DialogHeader>
                    <DialogTitle>Add New Album</DialogTitle>
                    <DialogDescription>
                        Add a new album to your collection
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    {/* input file disembunyikan dan dibuka melalui button Choose File */}
                    <input
                        type='file'
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept='image/*'
                        className='hidden'
                    />

                    <div
                        className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className='text-center'>
                            <div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
                                <Upload className='h-6 w-6 text-zinc-400' />
                            </div>

                            <div className='text-sm text-zinc-400 mb-2'>
                                {imageFile
                                    ? imageFile.name
                                    : "Upload album artwork"
                                }
                            </div>

                            <Button
                                variant='outline'
                                size='sm'
                                className='text-xs'
                            >
                                Choose File
                            </Button>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>
                            Album Title
                        </label>

                        <Input
                            value={newAlbum.title}
                            onChange={(e) =>
                                setNewAlbum({
                                    ...newAlbum,
                                    title: e.target.value
                                })
                            }
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='Enter album title'
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>
                            Artist
                        </label>

                        <Input
                            value={newAlbum.artist}
                            onChange={(e) =>
                                setNewAlbum({
                                    ...newAlbum,
                                    artist: e.target.value
                                })
                            }
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='Enter artist name'
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>
                            Release Year
                        </label>

                        <Input
                            type='number'
                            value={newAlbum.releaseYear}
                            onChange={(e) =>
                                setNewAlbum({
                                    ...newAlbum,
                                    releaseYear: parseInt(e.target.value)
                                })
                            }
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='Enter release year'
                            min={1900}
                            max={new Date().getFullYear()}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant='outline'
                        onClick={() => setIsAlbumDialogOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        className='bg-violet-500 hover:bg-violet-600'
                        disabled={
                            isLoading ||
                            !imageFile ||
                            !newAlbum.title ||
                            !newAlbum.artist
                        }
                    >
                        {isLoading ? "Creating..." : "Add Album"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddAlbumDialog