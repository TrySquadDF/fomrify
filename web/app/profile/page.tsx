'use client';
import { useGetMyForms } from "@/src/api/getMyForms";
import { FormCard } from "@/src/shared/ui/form-card";

export default function Profile() {
    const { data  } = useGetMyForms();

    return (
        <div className="flex gap-2.5 px-6 py-5 flex-wrap">
            {  data?.me?.forms.map((form) => 
                    <FormCard title={form.title} description={form.description} id={form.id} key={form.id} />
                )
            }
        </div>)
};
