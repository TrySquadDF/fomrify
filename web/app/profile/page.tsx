'use client';
import { useGetMyForms } from "@/src/api/getMyForms";
import { FormCard } from "@/src/shared/ui/form-card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList, LoaderIcon } from "lucide-react";
import Link from "next/link";

export default function Profile() {
    const { data, loading } = useGetMyForms();
    const forms = data?.me?.forms || [];

    return (
        <div className="container max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8 mx-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Мои формы</h1>
                    <p className="text-muted-foreground mt-1">
                        Создавайте формы и управляйте полученными ответами
                    </p>
                </div>
                
                <Link href="/forms/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Создать форму
                    </Button>
                </Link>
            </div>
            {/* Loading state */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <LoaderIcon className="animate-spin" />
                </div>
            )}

            {/* Empty state */}
            {!loading && forms.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">У вас пока нет форм</h3>
                    <p className="text-muted-foreground mb-6">Создайте свою первую форму для сбора ответов</p>
                    <Link href="/forms/new">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Создать форму
                        </Button>
                    </Link>
                </div>
            )}

            {/* Forms list */}
            {!loading && forms.length > 0 && (
                <div className="space-y-4">
                    {forms.map((form) => (
                        <FormCard 
                            key={form.id}
                            id={form.id}
                            title={form.title} 
                            description={form.description}
                            access={form.access}
                            createdAt={form.createdAt}
                            updatedAt={form.updatedAt}
                            className="flex-row w-full"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}