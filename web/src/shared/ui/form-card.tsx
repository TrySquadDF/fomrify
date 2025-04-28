import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight, CalendarIcon, Eye, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface FormCardProps {
  id: string;
  title: string;
  description?: string | null;
  access?: string;
  createdAt?: string;
  updatedAt?: string;
  className?: string;
}

export function FormCard({
  id,
  title,
  description,
  access = "PUBLIC",
  createdAt,
  className
}: FormCardProps) {
  const formattedDate = createdAt ? 
    format(new Date(createdAt), "d MMMM yyyy", { locale: ru }) : 
    null;
  
  return (
    <div className={cn(
      "transition-all",
      className
    )}>
      <div className="flex items-center p-4 w-full">
        {/* Левая часть с информацией о форме */}
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="font-medium text-lg truncate">
              {title || "Без названия"}
            </h3>
            <Badge variant={access === "PRIVATE" ? "outline" : "secondary"} className="shrink-0">
              {access === "PRIVATE" ? (
                <Lock className="h-3 w-3 mr-1" />
              ) : (
                <Unlock className="h-3 w-3 mr-1" />
              )}
              {access === "PRIVATE" ? "Приватная" : "Публичная"}
            </Badge>
          </div>
          
          {description && (
            <p className="text-muted-foreground text-sm line-clamp-1 mb-2">
              {description}
            </p>
          )}
          
          {formattedDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3 mr-1" />
              Создано: {formattedDate}
            </div>
          )}
        </div>
        
        {/* Правая часть с кнопками */}
        <div className="flex items-center gap-2 shrink-0">          
          <Link href={`/answers/${id}`}>
            <Button size="sm" variant="ghost">
              <Eye className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:ml-2">Ответы</span>
            </Button>
          </Link>
          <Link href={`/form/${id}`}>
            <Button size="sm" variant="secondary">
              <ArrowUpRight className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:ml-2">Перейти</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}