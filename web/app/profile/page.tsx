'use client';
import { useGetMyForms } from "@/src/api/getMyForms";
import { useUpdateFormAccess } from "@/src/api/updateFormAccess";
import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList, LoaderIcon } from "lucide-react";
import Link from "next/link";
import { FormAccess } from "@/src/gql/graphql";
import { useDeleteForm } from "@/src/api/deleteForm";
import { FormList } from "@/src/widgets/form-list/forms-view";
import { useMemo } from "react";

export default function Profile() {
    const { data, loading, refetch } = useGetMyForms();
    const { updateFormAccess } = useUpdateFormAccess();
    const { deleteForm } = useDeleteForm();

    const forms = useMemo(()=>  data?.me?.forms || [], [data]);

    const handleUpdateAccess = async (formId: string, newAccess: "PUBLIC" | "PRIVATE") => {
        try {
            await updateFormAccess(
                formId,
                newAccess as FormAccess
            );
            
            await refetch();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (formId: string) => {
        try {
            await deleteForm(formId);
            await refetch();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="container max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8 mx-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Мои формы</h1>
                    <p className="text-muted-foreground mt-1">
                        Создавайте формы и управляйте полученными ответами
                    </p>
                </div>
                
                <Link href="/form/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Создать форму
                    </Button>
                </Link>
            </div>
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <LoaderIcon className="animate-spin" />
                </div>
            )}

            {!loading && forms.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">У вас пока нет форм</h3>
                    <p className="text-muted-foreground mb-6">Создайте свою первую форму для сбора ответов</p>
                    <Link href="/form/new">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Создать форму
                        </Button>
                    </Link>
                </div>
            )}
            <FormList forms={forms} onDelete={handleDelete} onUpdateAccess={handleUpdateAccess} />
        </div>
    );
}