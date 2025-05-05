import React from 'react';
import { FormCard } from '@/src/shared/ui/form-card';
import { Form } from '@/src/gql/graphql'; // Assuming Form type is available

interface FormListProps {
    forms: Pick<Form, 'id' | 'title' | 'description' | 'access' | 'createdAt' | 'updatedAt'>[];
    onUpdateAccess:  (formId: string, newAccess: "PUBLIC" | "PRIVATE") => Promise<void>
    onDelete: (formId: string) => Promise<void>;
}

export const FormList: React.FC<FormListProps> = React.memo(({ forms, onUpdateAccess, onDelete }) => {
    return (
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
                    onUpdateAccess={onUpdateAccess}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
});

FormList.displayName = 'FormList';