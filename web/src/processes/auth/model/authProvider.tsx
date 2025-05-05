'use client'

import { Provider } from "react-redux";
import { store } from "@/src/store"
import { FC, PropsWithChildren } from "react";

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => <Provider store={store}>{children}</Provider>

