import FormView from "@/src/widgets/form-view/form-view";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  return (
    <div className="w-full flex justify-center my-8">
      <FormView formId={slug} />
    </div>
  );
}