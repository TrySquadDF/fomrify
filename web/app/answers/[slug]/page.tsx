import { FormAnswers } from "@/src/widgets/form-answers/form-answers";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return <div className="w-full flex justify-center my-8">
    <FormAnswers formId={slug} />
  </div>;
}