import { gql, useMutation } from '@apollo/client';
import { Form, FormInput } from '../gql/graphql';

// Define the GraphQL mutation
const CREATE_FORM_MUTATION = gql`
  mutation CreateTestForm(
    $title: String!,
    $description: String!,
    $access: AccessType!,
    $questions: [QuestionInput!]!
  ) {
    createForm(
      input: {
        title: $title
        description: $description
        access: $access
        questions: $questions
      }
    ) {
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
  return useMutation<{ createForm: Form },FormInput>(CREATE_FORM_MUTATION);
};