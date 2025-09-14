"use client";

import UserRegisterForm from "./UserRegisterForm";
import { useRouter } from "next/navigation";

export default function Step1Page() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6">1/3 사용자 등록</h1>
      <UserRegisterForm onNext={() => router.push("/owner/register/step2")} />
    </main>
  );
}
