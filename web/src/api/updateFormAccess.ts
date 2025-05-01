import { gql, useMutation } from '@apollo/client';
import { FormAccess } from '@/src/gql/graphql';

const UPDATE_FORM_ACCESS = gql`
  mutation UpdateFormAccess($id: ID!, $access: FormAccess!) {
    updateForm(id: $id, input: { access: $access }) {
      id
      title
      access
      updatedAt
    }
  }
`;

// Типы для хука
type UpdateFormAccessVariables = {
  id: string;
  access: FormAccess;
};

type UpdateFormAccessResponse = {
  updateForm: {
    id: string;
    title: string;
    access: FormAccess;
    updatedAt: string;
  };
};

export const useUpdateFormAccess = () => {
  const [mutate, { loading, error, data }] = useMutation<
    UpdateFormAccessResponse,
    UpdateFormAccessVariables
  >(UPDATE_FORM_ACCESS);

  const updateFormAccess = async (formId: string, newAccess: FormAccess) => {
    try {
      const response = await mutate({
        variables: {
          id: formId,
          access: newAccess,
        },
      });
      return response.data?.updateForm;
    } catch (err) {
      console.error('Error updating form access:', err);
      throw err;
    }
  };

  return {
    updateFormAccess,
    loading,
    error,
    data: data?.updateForm,
  };
};