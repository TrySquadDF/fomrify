import { Maybe, User } from "@/src/gql/graphql";
import { createContext, useContext } from "react";

export interface AuthContextType {
    isAuthenticated: boolean;
    user: Maybe<User>;
    error?: Maybe<string>;
    loading: boolean;
    login: () => void;
    logout: () => void;
    
}

const initialState: AuthContextType = {
    isAuthenticated: false,
    user: null,
    error: null,
    loading: false,
    login: () => {},
    logout: async () => {}
};


export const AuthContext = createContext<AuthContextType>(initialState);
export const useAuthContext = () => useContext(AuthContext);