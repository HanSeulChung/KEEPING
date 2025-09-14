"use client";

import StoreRegisterForm from "./StoreRegisterForm";
import { useRouter } from "next/navigation";

export default function Step3Page() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6">3/3 매장 등록</h1>
      <StoreRegisterForm onBack={() => router.push("/owner/register/step2")} />
    </main>
  );
}
