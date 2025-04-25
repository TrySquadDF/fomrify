import { Form } from "@/src/gql/graphql";
import { gql, useQuery } from "@apollo/client";

export const GET_FORM_BY_ID = gql`
        query GetForm($id: ID!) {
            form(id: $id) {
                id
                title
                description
                ownerId
                access
                createdAt
                updatedAt
                questions {
                    id
                    text
                    type
                    required
                    order
                    options {
                        id
                        text
                        order
                    }
                }
            }
        }
`

export const useGetFormById = (id: string) => useQuery<{ form?: Form }>(
    GET_FORM_BY_ID, 
    {
        variables: { id },
        fetchPolicy: 'network-only',
    }
)