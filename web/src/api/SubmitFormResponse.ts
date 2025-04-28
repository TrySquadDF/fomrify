import { gql, useMutation } from "@apollo/client";

const SUBMIT_FORM_RESPONSE = gql`
  mutation SubmitFormResponse($input: FormResponseInput!) {
    submitFormResponse(input: $input) {
      id
      formId
      createdAt
    }
  }
`;

export const useSubmitFormResponse = () => {
  return useMutation(SUBMIT_FORM_RESPONSE);
};