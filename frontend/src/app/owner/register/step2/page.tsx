"use client";

import BusinessRegisterForm from "./BusinessRegisterForm";
import { useRouter } from "next/navigation";

export default function Step2Page() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6">2/3 사업자 인증</h1>
      <BusinessRegisterForm
        onNext={() => router.push("/owner/register/step3")}
        onBack={() => router.push("/owner/register/step1")}
      />
    </main>
  );
}
