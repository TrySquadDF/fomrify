import { UserProfile } from "./user-profile/user-profile"

export const Header = ()=>{
    

    return <header className="flex h-16 items-center px-4 justify-between border-b-1">
       <div></div>
       <UserProfile />
    </header>
}