import { gql, useMutation } from '@apollo/client';
import { Form, FormInput } from '../gql/graphql';

const CREATE_FORM_MUTATION = gql`
  mutation CreateTestForm($input: FormInput!) {
    createForm(input: $input) {
      id
      title
      description
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
`;


export const useCreateForm = () => {
  return useMutation<{ createForm: Form }, { input: FormInput }>(CREATE_FORM_MUTATION);
};