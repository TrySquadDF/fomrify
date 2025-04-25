import { Test, TestProvider } from "@/components/test";

export default function Home() {
  return (
    <div className="flex">
      <Test />
      <TestProvider />
    </div>
  );
}
