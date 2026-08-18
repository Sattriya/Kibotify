import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../stores/useAuthStore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Album, Music } from "lucide-react"
import Header from "./components/Header"
import DashboardStats from "./components/DashboardStats"
import SongsTabContent from "./components/SongsTabContent"
import AlbumsTabContent from "./components/AlbumsTabContent"
import { useMusicStore } from "../../stores/useMusicStore"
import { useEffect } from "react"

const AdminPage = () => {
    const { isAdmin } = useAuthStore()
    const navigate = useNavigate()

    const {fetchAlbums, fetchSongs, fetchStats} = useMusicStore()

    useEffect(() => {
        fetchAlbums()
        fetchSongs()
        fetchStats()
    }, [fetchAlbums, fetchSongs, fetchStats])

    if (!isAdmin) navigate('/')
    return (
        <div
            className='min-h-screen bg-linear-to-b from-zinc-900 via-zinc-900
   to-black text-zinc-100 p-8'
        >
            <Header />

            <DashboardStats />

            <Tabs defaultValue='songs' className='space-y-6'>
                <TabsList className='p-1 bg-zinc-800/50'>
                    <TabsTrigger value='songs' className='data-state-active:bg-zinc-700'>
                        <Music className="mr-2 size-4" />
                        Songs
                    </TabsTrigger>
                    <TabsTrigger value='albums' className='data-state-active:bg-zinc-700'>
                        <Album className="mr-2 size-4" />
                        Albums
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='songs'>
                    <SongsTabContent />
                </TabsContent>
                <TabsContent value='albums'>
                    <AlbumsTabContent />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AdminPage
