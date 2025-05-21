import DefaultLayout from "@/components/Layouts/DefaultLayout";
import MagageModels from "./manage-models/page";

export default function Home() {
  return (
    <>
      <DefaultLayout>
        <MagageModels />
      </DefaultLayout>
    </>
  );
}
