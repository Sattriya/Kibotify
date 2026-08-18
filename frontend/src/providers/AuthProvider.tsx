import { useAuth } from "@clerk/react"
import { useEffect, useState } from "react"
import axios from "../lib/axios"
import { Loader } from "lucide-react"
import { useAuthStore } from "../stores/useAuthStore"
import { useChatStore } from "../stores/useChatStore"

const updateApiToken = async (token: string | null) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete axios.defaults.headers.common['Authorization']
    }
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { getToken, userId } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const { checkAdminStatus } = useAuthStore()
    const { initSocket, disconnectSocket } = useChatStore()

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = await getToken()
                updateApiToken(token)

                if (token) {
                    await checkAdminStatus()

                    if (userId) initSocket(userId)
                }

            } catch (err) {
                updateApiToken(null)
                console.log(err)
            } finally {
                setIsLoading(false)
            }
        }

        initAuth()

        return () => disconnectSocket()
    }, [getToken, userId, checkAdminStatus, initSocket, disconnectSocket])

    if (isLoading) {
        return (
            <div className='h-screen w-full flex items-center justify-center'>
                <Loader className='size-8 text-emerald-500 animate-spin' />
            </div>
        )
    }

    return (
        <div>
            {children}
        </div>
    )
}

export default AuthProvider
