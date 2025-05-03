import { routeTo } from "@/src/shared/routes/rest-routes"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { AuthContextType } from "./authContext"
import { useGetMe } from "../api/get-me"

export const useAuthProvide = (): AuthContextType => {
    const router = useRouter()
    const { data, loading, error, refetch } = useGetMe()
    
    const user = data?.me || null
    const isAuthenticated = !!user

    function login() {
        router.push(routeTo('login'))
    }

    async function emailLogin(email: string, password: string) {
        try {
            const response = await fetch(routeTo('emailLogin'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Login failed')
            }

            await refetch()
            return true
        } catch (e) {
            console.error("Login error:", e)
            throw e
        }
    }

    async function register(email: string, password: string, displayName: string) {
        try {
            const response = await fetch(routeTo('register'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password, displayName }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Registration failed')
            }

            await refetch()
            return true
        } catch (e) {
            console.error("Registration error:", e)
            throw e
        }
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
        emailLogin,
        register,
        logout,
    }
}
