import { routeTo } from "@/src/shared/routes/rest-routes"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { AuthContextType } from "./authContext"
import { useGetMe } from "../api/get-me"

export const useAuthProvide = (): AuthContextType => {
    const router = useRouter()
    const { data, loading, error } = useGetMe()
    
    const user = data?.me || null
    const isAuthenticated = !!user

    function login() {
        router.push(routeTo('login'))
    }

    const logout = async () => {
        try {
            await fetch(routeTo('logout'), { method: 'GET', credentials: 'include' })
            window.location.reload()
        } catch (e) {
            console.error("Logout error:", e)
        }

        router.refresh();
    }

    useEffect(() => {
        if (error) {
            console.error("Authentication error:", error)
        }
    }, [error])

    return {
        user,
        error: error?.message || null,
        loading,
        isAuthenticated,
        login,
        logout,
    }
}