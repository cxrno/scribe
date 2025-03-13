"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function AuthButton({ label }: { label: string}) {
  return (
    <button className="bg-[#2B2B2B] h-14 text-white rounded-xl w-3/4 justify-center items-center flex flex-row gap-2 text-xl shadow-2xl mt-2 hover:bg-[#3B3B3B] cursor-pointer" onClick={() => signIn("google")}>
      <Image src="/google.webp" className="w-6 h-6" alt="Google Logo" width={24} height={24} />
      {label}
    </button>
  );
}