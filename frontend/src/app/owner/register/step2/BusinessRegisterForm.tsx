"use client";

import { useState } from "react";
import { useOwnerRegisterStore } from "@/store/useOwnerRegisterStore";

export default function BusinessRegisterForm({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { businessNumber, openDate, ceoName, setRegister } = useOwnerRegisterStore();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!businessNumber) newErrors.businessNumber = "사업자 등록번호는 필수입니다.";
    if (!openDate) newErrors.openDate = "개업일자는 필수입니다.";
    if (!ceoName) newErrors.ceoName = "대표자 이름은 필수입니다.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;
    onNext(); // ✅ Step3으로 이동
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="사업자 등록번호"
        value={businessNumber}
        onChange={(e) => setRegister({ businessNumber: e.target.value })}
        className={`border p-2 rounded ${errors.businessNumber ? "border-red-500" : ""}`}
      />
      {errors.businessNumber && <p className="text-red-500 text-sm">{errors.businessNumber}</p>}

      <input
        type="text"
        placeholder="개업일자 (YYYY-MM-DD)"
        value={openDate}
        onChange={(e) => setRegister({ openDate: e.target.value })}
        className={`border p-2 rounded ${errors.openDate ? "border-red-500" : ""}`}
      />
      {errors.openDate && <p className="text-red-500 text-sm">{errors.openDate}</p>}

      <input
        type="text"
        placeholder="대표자 이름"
        value={ceoName}
        onChange={(e) => setRegister({ ceoName: e.target.value })}
        className={`border p-2 rounded ${errors.ceoName ? "border-red-500" : ""}`}
      />
      {errors.ceoName && <p className="text-red-500 text-sm">{errors.ceoName}</p>}

      <div className="flex justify-between mt-4">
        <button type="button" onClick={onBack} className="px-4 py-2 border rounded">
          이전
        </button>
        <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded">
          다음
        </button>
      </div>
    </form>
  );
}
