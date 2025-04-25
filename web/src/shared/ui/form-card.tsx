import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";

interface FormCardProps extends PropsWithChildren {
    id: string
    title: string
    description: string
} 

export function FormCard(props: FormCardProps){
    const router = useRouter()

    return <Card className="w-[340px]">
        <CardHeader>
            <CardTitle>{props.title}</CardTitle>
            <CardDescription>{props.description}</CardDescription>
        </CardHeader>
        <CardFooter>
        <Button className="w-full hover:cursor-pointer" onClick={() => router.push(`/form/${props.id}`)}>
          <ArrowUpRight/> Перейти
        </Button>
      </CardFooter>
  </Card>
}