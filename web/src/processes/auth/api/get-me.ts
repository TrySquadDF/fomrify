import { User } from "@/src/gql/graphql";
import { gql, useQuery } from "@apollo/client";

const getMe = gql`
    query GetMe {
        me {
            id
            email
            displayName
            picture
            googleId
            isBanned
        }
    }
`

export const useGetMe = () => useQuery<{ me?: User }>(getMe, {
    fetchPolicy: 'network-only',
})