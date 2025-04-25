'use client'

import { FC, PropsWithChildren } from "react"
import { AuthContext } from "./authContext"
import { useAuthProvide } from "./useAuthProvide"


export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
    const auth = useAuthProvide()

    return <AuthContext.Provider value={auth}>
        {children}
    </AuthContext.Provider>
}