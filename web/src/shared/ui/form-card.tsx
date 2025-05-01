import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight, CalendarIcon, Eye, Lock, Unlock, Loader2, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { FormAccess } from "@/src/gql/graphql";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type FormAccessType = "PUBLIC" | "PRIVATE";

interface FormCardProps {
  id: string;
  title: string;
  description?: string | null;
  access: FormAccess;
  createdAt?: string;
  updatedAt?: string;
  className?: string;
  onUpdateAccess?: (id: string, newAccess: FormAccessType) => Promise<void>;
  onDelete?: (id: string) => Promise<unknown>;
}

export function FormCard({
  id,
  title,
  description,
  access,
  createdAt,
  className,
  onUpdateAccess,
  onDelete
}: FormCardProps) {
  const formattedDate = createdAt ? 
    format(new Date(createdAt), "d MMMM yyyy", { locale: ru }) : 
    null;
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleAccessChange = async (newAccess: FormAccessType) => {
    if (access === newAccess || !onUpdateAccess || isUpdating) return;
    
    try {
      setIsUpdating(true);
      await onUpdateAccess(id, newAccess);
    } catch (error) {
      console.error("Ошибка при обновлении доступа:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await onDelete(id);
    } catch (error) {
      console.error("Ошибка при удалении формы:", error);
      setIsDeleting(false);
    }
  };
  
  return (
    <div className={cn(
      "transition-all",
      className
    )}>
      <div className="flex items-center p-4 w-full">
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="font-medium text-lg truncate">
              {title || "Без названия"}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={isUpdating}>
                <Badge 
                  variant={access === "PRIVATE" ? "outline" : "secondary"} 
                  className={cn(
                    "shrink-0 cursor-pointer hover:opacity-80 transition-opacity",
                    isUpdating && "cursor-not-allowed opacity-50"
                  )}
                >
                  {isUpdating ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : access === "PRIVATE" ? (
                    <Lock className="h-3 w-3 mr-1" />
                  ) : (
                    <Unlock className="h-3 w-3 mr-1" />
                  )}
                  {access === "PRIVATE" ? "Приватная" : "Публичная"}
                </Badge>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="start">
                <DropdownMenuItem 
                  onClick={() => handleAccessChange("PUBLIC")}
                  disabled={access === "PUBLIC" || isUpdating}
                >
                  <Unlock className="h-3 w-3 mr-2" />
                  Публичная
                  {access === "PUBLIC" && <Check className="h-3 w-3 ml-auto" />}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => handleAccessChange("PRIVATE")}
                  disabled={access === "PRIVATE" || isUpdating}
                >
                  <Lock className="h-3 w-3 mr-2" />
                  Приватная
                  {access === "PRIVATE" && <Check className="h-3 w-3 ml-auto" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        
        <div className="flex items-center gap-2 shrink-0">          
          <Link href={`/answers/${id}`}>
            <Button size="sm" variant="ghost">
              <Eye className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:ml-2">Ответы</span>
            </Button>
          </Link>
          
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only md:ml-2">Удалить</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                  <AlertDialogDescription>
                    Вы уверены, что хотите удалить форму {title || 'Без названия'}?
                    Это действие невозможно отменить, и все ответы на эту форму будут удалены.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete} 
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Удаление...
                      </>
                    ) : "Удалить"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
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