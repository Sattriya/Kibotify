import { useAuth } from "@clerk/react"
import { useEffect, useState } from "react"
import axios from "../lib/axios"
import { Loader } from "lucide-react"
import { useAuthStore } from "../stores/useAuthStore"
import { useChatStore } from "../stores/useChatStore"

// function untuk mengatur token Clerk ke dalam header Axios
const updateApiToken = async (token: string | null) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        // menghapus token dari header jika user tidak memiliki token
        delete axios.defaults.headers.common['Authorization']
    }
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    // mengambil function getToken dan id user dari Clerk
    const { getToken, userId } = useAuth();

    // state untuk mengatur loading saat proses autentikasi
    const [isLoading, setIsLoading] = useState(true);

    // mengambil function untuk mengecek status admin
    const { checkAdminStatus } = useAuthStore()

    // mengambil function untuk mengatur koneksi Socket.io
    const { initSocket, disconnectSocket } = useChatStore()

    // function untuk menginisialisasi autentikasi dan koneksi user
    useEffect(() => {
        const initAuth = async () => {
            try {
                // mengambil token autentikasi dari Clerk
                const token = await getToken()

                // memasukkan token ke header Axios agar request API terautentikasi
                updateApiToken(token)

                if (token) {
                    // mengecek apakah user merupakan admin
                    await checkAdminStatus()

                    // menghubungkan user ke Socket.io
                    if (userId) initSocket(userId)
                }

            } catch (err) {
                // menghapus token jika terjadi error
                updateApiToken(null)
                console.log(err)
            } finally {
                // menandai bahwa proses autentikasi sudah selesai
                setIsLoading(false)
            }
        }

        initAuth()

        // memutuskan koneksi socket ketika component di-unmount
        return () => disconnectSocket()
    }, [getToken, userId, checkAdminStatus, initSocket, disconnectSocket])

    // menampilkan loading sebelum proses autentikasi selesai
    if (isLoading) {
        return (
            <div className='h-screen w-full flex items-center justify-center'>
                <Loader className='size-8 text-emerald-500 animate-spin' />
            </div>
        )
    }

    // menampilkan component yang dibungkus oleh AuthProvider
    return (
        <div>
            {children}
        </div>
    )
}

export default AuthProvider