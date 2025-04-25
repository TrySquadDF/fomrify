'use client'

import { FC } from "react"
import { Profile } from "../ui/profile"
import { useAuthContext } from "@/src/processes/auth/model/authContext"
import { GButton } from "../ui/g-button"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"


const USER_NAVIGATION_LINKS = [{
    label: 'Профиль',
    href: '/profile'
}]

export const UserProfile: FC = () => {
    const { isAuthenticated, loading, user, login, logout } = useAuthContext()

    if (loading) {
        return <Profile.Skeleton />
    }

    if (!isAuthenticated) {
        return <div className="flex"><GButton onClick={login} /></div>
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="rounded-full p-2.5">
                    <Profile displayName={user?.displayName} picture={user?.picture} />
                 </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                        {user?.email && (
                             <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                             </p>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {USER_NAVIGATION_LINKS.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                        <Link href={link.href}>
                            {link.label}
                        </Link>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {logout && (
                    <DropdownMenuItem onClick={logout}>
                        Выйти
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}