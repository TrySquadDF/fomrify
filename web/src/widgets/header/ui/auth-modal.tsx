'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { GButton } from '@/src/widgets/header/ui/g-button';
import { useUserSession } from '@/src/processes/auth/model/useUserSession';
import { LoginForm, loginSchema, LoginValues } from './login-form';
import { RegistrationForm, registrationSchema, RegistrationValues } from './registration-form';

interface AuthModalProps {
  trigger?: React.ReactNode;
  initialView?: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthModal({ trigger, initialView = 'login', onSuccess }: AuthModalProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isLoginView, setIsLoginView] = React.useState<boolean>(initialView === 'login');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const { emailLogin, register: registerUser, login: googleLogin, error } = useUserSession();
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
    if(error) { 
      handleError(error, 'login')
      return
    }

    toast.success(isLoginView ? 'Вход выполнен успешно!' : 'Регистрация прошла успешно!');
    setIsOpen(false);
    if (onSuccess) {
      onSuccess();
    } else {
      router.refresh();
    }
  }, [isLoginView, onSuccess, router]);

  const handleError = React.useCallback((error: unknown, formType: 'login' | 'register' | 'google') => {
    const defaultMessage =
      formType === 'login' ? 'Неверный email или пароль.' :
      formType === 'register' ? 'Ошибка регистрации. Email может быть занят.' :
      'Ошибка входа через Google.';
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    toast.error(errorMessage);

    if (formType === 'login') {
      loginForm.setError('root.apiError', { type: 'manual', message: errorMessage });
    } else if (formType === 'register') {
      registrationForm.setError('root.apiError', { type: 'manual', message: errorMessage });
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
      }
    },
    [emailLogin, loginForm, handleSuccess, handleError]
  );

  const handleRegisterSubmit = React.useCallback(
    async (values: RegistrationValues) => {
      setIsSubmitting(true);
      registrationForm.clearErrors();
      try {
        await registerUser(values.email, values.password, values.displayName);
        handleSuccess();
      } catch (err: unknown) {
        handleError(err, 'register');
      } finally {
        setIsSubmitting(false);
      }
    },
    [registerUser, registrationForm, handleSuccess, handleError]
  );

  const handleGoogleLogin = React.useCallback(async () => {
    setIsSubmitting(true);
    try {
      await googleLogin();
      handleSuccess();
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
            <LoginForm form={loginForm} onSubmit={handleEmailLogin} isSubmitting={isSubmitting} />
          ) : (
            <RegistrationForm form={registrationForm} onSubmit={handleRegisterSubmit} isSubmitting={isSubmitting} />
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