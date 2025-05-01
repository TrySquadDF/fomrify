
import { gql, useMutation } from '@apollo/client';

const DELETE_FORM_MUTATION = gql`
  mutation DeleteForm($id: ID!) {
    deleteForm(id: $id)
  }
`;


export function useDeleteForm() {
  const [deleteFormMutation, { loading, error, data }] = useMutation(DELETE_FORM_MUTATION);

  const deleteForm = async (id: string): Promise<boolean> => {
    try {
      const response = await deleteFormMutation({
        variables: { id }
      });
      
      return response.data?.deleteForm || false;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    deleteForm,
    isDeleting: loading,
    error,
    success: data?.deleteForm === true
  };
}