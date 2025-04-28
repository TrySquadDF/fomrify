import { gql, useQuery } from "@apollo/client";
import { FormResponse } from "../gql/graphql";

export const GET_FORM_RESPONSES = gql`
    query GetFormResponses($formId: ID!) {
        formResponses(formId: $formId) {
            id
            formId
            createdAt
            answers {
                id
                questionId
                textValue
                boolValue
                numberValue
                dateValue
                question {
                    text
                }
                selectedOptions {
                    id
                    text
                }
            }
        }
    }
`;


export function useGetFormResponses(formId: string | undefined) {
    return useQuery<{ formResponses: FormResponse[] }>(GET_FORM_RESPONSES, {
      variables: { formId: formId || "" },
      skip: !formId,
      fetchPolicy: "network-only",
      errorPolicy: "all",
    });
  }