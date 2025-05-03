import { Maybe, User } from "@/src/gql/graphql";
import { createContext, useContext } from "react";

export interface AuthContextType {
    isAuthenticated: boolean;
    user: Maybe<User>;
    error?: Maybe<string>;
    loading: boolean;
    emailLogin: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, displayName: string) => Promise<boolean>;
    login: () => void;
    logout: () => void;
    
}

const initialState: AuthContextType = {
    isAuthenticated: false,
    user: null,
    error: null,
    loading: false,
    emailLogin: async () => false,
    register: async () => false,
    login: () => {},
    logout: async () => {}
};


export const AuthContext = createContext<AuthContextType>(initialState);
export const useAuthContext = () => useContext(AuthContext);