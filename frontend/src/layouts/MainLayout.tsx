import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSideBar";
import FriendsActivity from "./components/FriendsActivity";
import AudioPlayer from "./components/AudioPlayer";
import PlayBackControls from "./components/PlayBackControls";
import { useEffect, useState } from "react";

const MainLayout = () => {
    // state untuk menentukan apakah aplikasi sedang dibuka di mobile
    const [isMobile, setIsMobile] = useState(false)

    // mengecek ukuran layar dan menyesuaikan layout ketika ukuran berubah
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        // mengecek ukuran layar saat component pertama kali dijalankan
        checkMobile()

        // mengecek kembali ketika ukuran browser berubah
        window.addEventListener("resize", checkMobile)

        // menghapus event listener ketika component di-unmount
        return () => window.removeEventListener("resize", checkMobile)
    }, [setIsMobile, isMobile])

    return (
        <div className='h-screen bg-black text-white flex flex-col'>
            <ResizablePanelGroup
                orientation='horizontal'
                className='flex-1 flex h-full overflow-hidden p-2'
            >
                {/* audio player digunakan untuk mengatur audio yang sedang diputar */}
                <AudioPlayer />

                {/* sidebar utama aplikasi */}
                <ResizablePanel
                    defaultSize="25%"
                    minSize={isMobile ? "0%" : "10%"}
                    maxSize="20%"
                >
                    <LeftSidebar />
                </ResizablePanel>

                <ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

                {/* Outlet digunakan untuk menampilkan halaman sesuai dengan route */}
                <ResizablePanel defaultSize={isMobile ? "80%" : "60%"}>
                    <Outlet />
                </ResizablePanel>

                {/* FriendsActivity disembunyikan ketika menggunakan mobile */}
                {!isMobile && (
                    <>
                        <ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

                        <ResizablePanel
                            defaultSize="20%"
                            minSize="0%"
                            maxSize="20%"
                            collapsedSize="0%"
                        >
                            <FriendsActivity />
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>

            {/* control untuk play, pause, next, previous dan pengaturan audio */}
            <PlayBackControls />
        </div>
    )
}

export default MainLayout