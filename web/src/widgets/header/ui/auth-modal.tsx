'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { GButton } from '@/src/widgets/header/ui/g-button';
import { useUserSession } from '@/src/processes/auth/model/useUserSession';

const loginSchema = z.object({
  email: z.string().email({ message: 'Неверный формат email.' }),
  password: z.string().min(6, { message: 'Пароль должен быть не менее 6 символов.' }),
});
type LoginValues = z.infer<typeof loginSchema>;

const registrationSchema = z.object({
  displayName: z.string().min(2, { message: 'Имя должно содержать минимум 2 символа.' }),
  email: z.string().email({ message: 'Неверный формат email.' }),
  password: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов.' }),
});
type RegistrationValues = z.infer<typeof registrationSchema>;

interface AuthModalProps {
  trigger?: React.ReactNode;
  initialView?: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthModal({ trigger, initialView = 'login', onSuccess }: AuthModalProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isLoginView, setIsLoginView] = React.useState<boolean>(initialView === 'login');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const { emailLogin, register, login: googleLogin } = useUserSession();
  const router = useRouter();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  const registrationForm = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { displayName: '', email: '', password: '' },
    mode: 'onSubmit',
  });

  const handleSuccess = React.useCallback(() => {
    toast.success(isLoginView ? 'Вход выполнен успешно!' : 'Регистрация прошла успешно!');
    setIsOpen(false);
    if (onSuccess) {
      onSuccess();
    } else {
      router.refresh()
    }
  }, [isLoginView, onSuccess, router]);

  const handleError = React.useCallback((error: unknown, formType: 'login' | 'register' | 'google') => {
    const defaultMessage =
      formType === 'login' ? 'Неверный email или пароль.' :
      formType === 'register' ? 'Ошибка регистрации. Email может быть занят.' :
      'Ошибка входа через Google.';
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    toast.error(errorMessage);

    const formToUse = formType === 'login' ? loginForm : registrationForm;
    if (formType !== 'google') {
      formToUse.setError("root.apiError", { type: "manual", message: errorMessage });
    }
    console.error(`${formType} error:`, error);
  }, [loginForm, registrationForm]); 

  const handleEmailLogin = React.useCallback(
    async (values: LoginValues) => {
      setIsSubmitting(true);
      loginForm.clearErrors();
      try {
        await emailLogin(values.email, values.password);
        handleSuccess();
      } catch (err: unknown) {
        handleError(err, 'login');
      } finally {
        setIsSubmitting(false);
      }
    },
    [emailLogin, loginForm, handleSuccess, handleError]
  );

  const handleRegisterSubmit = React.useCallback(
    async (values: RegistrationValues) => {
      setIsSubmitting(true);
      registrationForm.clearErrors();
      try {
        await register(values.email, values.password, values.displayName);
        handleSuccess();
      } catch (err: unknown) {
        handleError(err, 'register');
      } finally {
        setIsSubmitting(false);
      }
    },
    [register, registrationForm, handleSuccess, handleError]
  );

  const handleGoogleLogin = React.useCallback(async () => {
    setIsSubmitting(true);
    try {
      await googleLogin();
    } catch (err: unknown) {
      handleError(err, 'google');
      setIsSubmitting(false);
    }
  }, [googleLogin, handleSuccess, handleError]);

  const toggleView = React.useCallback(() => {
    setIsLoginView((prev) => !prev);
    loginForm.reset();
    registrationForm.reset();
    loginForm.clearErrors();
    registrationForm.clearErrors();
  }, [loginForm, registrationForm]);

   const onOpenChange = React.useCallback((open: boolean) => {
     setIsOpen(open);
     if (!open) {
       setTimeout(() => {
         loginForm.reset();
         registrationForm.reset();
         setIsLoginView(initialView === 'login');
         setIsSubmitting(false);
         loginForm.clearErrors();
         registrationForm.clearErrors();
       }, 150);
     }
   }, [initialView, loginForm, registrationForm]);

   const renderTrigger = () => {
     if (!trigger) return null;
     if (React.isValidElement(trigger)) {
       return <DialogTrigger asChild>{trigger}</DialogTrigger>;
     } else {
       console.error("AuthModal: Invalid 'trigger' prop.", trigger);
       return <DialogTrigger asChild><Button variant="outline">Error</Button></DialogTrigger>;
     }
   };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {renderTrigger()}
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-center text-2xl font-bold">
            {isLoginView ? 'Вход' : 'Регистрация'}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {isLoginView ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleEmailLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
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
                  control={loginForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                        disabled={isSubmitting}
                        aria-invalid={!!fieldState.error}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {loginForm.formState.errors.root?.apiError && (
                  <div role="alert" className="text-sm font-medium text-destructive">
                    {loginForm.formState.errors.root.apiError.message}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Вход...' : 'Войти'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...registrationForm}>
              <form onSubmit={registrationForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registrationForm.control}
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
                  control={registrationForm.control}
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
                  control={registrationForm.control}
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
                {registrationForm.formState.errors.root?.apiError && (
                  <div role="alert" className="text-sm font-medium text-destructive">
                    {registrationForm.formState.errors.root.apiError.message}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
              </form>
            </Form>
          )}

          <div className="relative pt-4"> 
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">или</span>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <GButton onClick={handleGoogleLogin} disabled={isSubmitting} />
          </div>
        </div>

        <DialogFooter className="sm:justify-center p-6 pt-0">
          <Button variant="link" onClick={toggleView} disabled={isSubmitting} className="text-sm">
            {isLoginView ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 