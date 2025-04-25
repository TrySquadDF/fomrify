import client from "@/lib/apolloClient"
import { GET_FORM_BY_ID } from "@/src/api/getForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FormView from "@/src/widgets/form-view/form-view";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { data, error } = await client.query({
    query: GET_FORM_BY_ID, 
    variables: { id: slug }
  });
  
  if (error) {
    return (
      <div className="container max-w-3xl py-12">
        <Alert variant="destructive">
          <AlertTitle>Ошибка загрузки формы</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data?.form) {
    return (
      <div className="container max-w-3xl py-12">
        <Alert>
          <AlertTitle>Форма не найдена</AlertTitle>
          <AlertDescription>
            Форма с ID {slug} не существует или у вас нет к ней доступа.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <div className="w-full flex justify-center my-8">
    <FormView form={data.form} />
  </div>;
}