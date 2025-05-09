import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export const registrationSchema = z.object({
  displayName: z.string().min(2, { message: 'Имя должно содержать минимум 2 символа.' }),
  email: z.string().email({ message: 'Неверный формат email.' }),
  password: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов.' }),
});

export type RegistrationValues = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  form: UseFormReturn<RegistrationValues>;
  onSubmit: (values: RegistrationValues) => void;
  isSubmitting: boolean;
}

export function RegistrationForm({ form, onSubmit, isSubmitting }: RegistrationFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <Input
                placeholder="Ваше имя"
                autoComplete="name"
                {...field}
                disabled={isSubmitting}
                aria-invalid={!!fieldState.error}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...field}
                disabled={isSubmitting}
                aria-invalid={!!fieldState.error}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <Input
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...field}
                disabled={isSubmitting}
                aria-invalid={!!fieldState.error}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root?.apiError && (
          <div role="alert" className="text-sm font-medium text-destructive">
            {form.formState.errors.root.apiError.message}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
      </form>
    </Form>
  );
}