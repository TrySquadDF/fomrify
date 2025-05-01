import { User } from "@/src/gql/graphql";
import { gql, useQuery } from "@apollo/client";

const getMyForms = gql`
        query {
            me {
                forms {
                    id
                    title
                    description
                    access
                    createdAt
                    updatedAt
                }
            }
        }
`

export const useGetMyForms = () => useQuery<{ me?: Pick<User, 'forms'> }>(getMyForms, {
    fetchPolicy: 'cache-first',
})