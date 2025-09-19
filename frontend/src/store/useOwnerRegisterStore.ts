import { create } from "zustand";

interface OwnerRegisterState {
  // 1단계 (사용자 등록)
  name: string;
  email: string;
  phone: string;
  birth: string;
  gender: "MALE" | "FEMALE";
  profileImgUrl: string;

  // 2단계 (사업자 인증)
  businessNumber: string;
  openDate: string;
  ceoName: string;

  // 3단계 (매장 등록)
  category: string;
  address: string;
  description: string;
  accountNumber: string;
  storeImgUrl: string;

  setRegister: (data: Partial<OwnerRegisterState>) => void;
  resetRegister: () => void;
}

export const useOwnerRegisterStore = create<OwnerRegisterState>((set) => ({
  
  name: "",
  email: "",
  phone: "",
  birth: "",
  gender: "MALE",
  profileImgUrl: "/customer.png",

  businessNumber: "",
  openDate: "",
  ceoName: "",

  category: "",
  address: "",
  description: "",
  accountNumber: "",
  storeImgUrl: "/owner.png",

  // update
  setRegister: (data) => set((state) => ({ ...state, ...data })),

  // 처음 렌더링, 중간 취소 경우 초기화
  resetRegister: () =>
    set({
      name: "",
      email: "",
      phone: "",
      birth: "",
      gender: "MALE",
      profileImgUrl: "/customer.png",
      businessNumber: "",
      openDate: "",
      ceoName: "",
      category: "",
      address: "",
      description: "",
      accountNumber: "",
      storeImgUrl: "/owner.png",
    }),
}));