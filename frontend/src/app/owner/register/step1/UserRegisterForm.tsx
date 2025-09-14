"use client";

import { useState } from "react";
import { useOwnerRegisterStore } from "@/store/useOwnerRegisterStore";

export default function UserRegisterForm({ onNext }: { onNext: () => void }) {
  const { name, email, phone, birth, gender, setRegister } = useOwnerRegisterStore();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!name) newErrors.name = "이름은 필수입니다.";
    if (!email) newErrors.email = "이메일은 필수입니다.";
    if (!phone) newErrors.phone = "전화번호는 필수입니다.";
    if (!birth) newErrors.birth = "생년월일은 필수입니다.";
    if (!gender) newErrors.gender = "성별은 필수입니다.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;
    onNext(); // ✅ Step2로 이동
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="이름"
        value={name}
        onChange={(e) => setRegister({ name: e.target.value })}
        className={`border p-2 rounded ${errors.name ? "border-red-500" : ""}`}
      />
      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setRegister({ email: e.target.value })}
        className={`border p-2 rounded ${errors.email ? "border-red-500" : ""}`}
      />
      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

      <input
        type="text"
        placeholder="전화번호"
        value={phone}
        onChange={(e) => setRegister({ phone: e.target.value })}
        className={`border p-2 rounded ${errors.phone ? "border-red-500" : ""}`}
      />
      {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

      <input
        type="text"
        placeholder="생년월일 (YYYY-MM-DD)"
        value={birth}
        onChange={(e) => setRegister({ birth: e.target.value })}
        className={`border p-2 rounded ${errors.birth ? "border-red-500" : ""}`}
      />
      {errors.birth && <p className="text-red-500 text-sm">{errors.birth}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRegister({ gender: "MALE" })}
          className={`flex-1 border p-2 rounded ${gender === "MALE" ? "bg-gray-800 text-white" : ""}`}
        >
          남성
        </button>
        <button
          type="button"
          onClick={() => setRegister({ gender: "FEMALE" })}
          className={`flex-1 border p-2 rounded ${gender === "FEMALE" ? "bg-gray-800 text-white" : ""}`}
        >
          여성
        </button>
      </div>
      {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}

      <button type="submit" className="bg-gray-800 text-white rounded py-2 mt-4">
        다음
      </button>
    </form>
  );
}
