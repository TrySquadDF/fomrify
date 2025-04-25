import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PropsWithChildren } from "react";

export interface ProfileProps extends PropsWithChildren {
    picture?: string
    displayName?: string
}

export const Profile = (props: ProfileProps) => {
    return <div className="flex justify-center items-center gap-2.5">
        {props.displayName}
        <Avatar>
            <AvatarImage src={props.picture} />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
    </div>
}

Profile.displayName = "Profile"

Profile.Skeleton = function ProfileSkeleton() {
    return  <div className="flex items-center space-x-4">
    <div className="space-y-2 flex items-end flex-col">
      <Skeleton className="h-2 w-[250px]" />
      <Skeleton className="h-2 w-[200px]" />
    </div>
    <Skeleton className="h-8 w-8 rounded-full" />
  </div>
}
