import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
    link: new HttpLink({ uri: 'https://localhost:8080/query', credentials: 'include' }),
    credentials: 'include',
    cache: new InMemoryCache(),
    ssrMode: typeof window === 'undefined'
});

export default client