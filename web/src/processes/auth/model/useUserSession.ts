import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';

import { emailLogin, register, logout, setUser } from '@/src/store/slices/authSlice';
import { routeTo } from '@/src/shared/routes/rest-routes';
import { useGetMe } from '../api/get-me';
import { useEffect } from 'react';

export const useUserSession = () => {
  const router = useRouter();
  const retrieveUserDataQuery = useGetMe()

  const { user, loading, error, isAuthenticated} = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (retrieveUserDataQuery.data?.me) {
      dispatch(setUser(retrieveUserDataQuery.data.me));
    }
  }, [retrieveUserDataQuery.data?.me]);

  const handleEmailLogin = async (email: string, password: string) => {
    try {
      await dispatch(emailLogin({ email, password }));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }

  const handleRegister = async (email: string, password: string, displayName: string) => {
    try {
      await dispatch(register({ email, password, displayName }));
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  }

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: () => router.push(routeTo('login')),
    emailLogin: handleEmailLogin,
    register: handleRegister,
    logout: handleLogout,
  };
};