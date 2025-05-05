'use client'

import { HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";

function makeClient() {
    const httpLink = new HttpLink({ uri: 'https://localhost:8080/query', credentials: 'include' });

    return  new ApolloClient({
        link: httpLink,
        credentials: 'include',
        cache: new InMemoryCache(),
    });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
    return (
      <ApolloNextAppProvider makeClient={makeClient}>
        {children}
      </ApolloNextAppProvider>
    );
}
