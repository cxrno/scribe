"use client";

import AuthButton from "./components/sign-in";
import Image from "next/image";
import { FaLocationArrow, FaImage, FaPaintBrush, FaCamera, FaMicrophone, FaEye, FaPencilAlt, FaFileAlt, FaEllipsisV} from "react-icons/fa";
import { IconType } from 'react-icons';
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";


function NumberedAttachments({ icon: Icon, number }: { icon: IconType, number: number }) {
  return (
    <div className="relative inline-block">
      <div className="w-12 h-12 flex items-center justify-center text-white">
        <Icon className="w-10 h-10" />
      </div>
      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center shadow-2xl justify-center rounded-full bg-blue-500 text-white text-sm font-bold">
        {number}
      </div>
    </div>
  );
}

function MockReport() {
  return (
    <div className="flex flex-col w-11/12 max-w-sm rounded-xl shadow-2xl bg-[#202649]">
      <div className="flex flex-row gap-2">
        <p className="text-white text-left text-xl font-thin pt-4 pl-6">Incident Report</p>
        <button className="ml-auto pr-4 pt-4">
          <FaEllipsisV className="w-5 h-5" />
        </button>
      </div>
      <p className="text-[#929292] text-sm pl-6"> 2/21/2025 4:28 PM</p>
      <div className="flex flex-row gap-1 pl-6">
        <div className="flex flex-row gap-1 pt-2 shadow-2xl">
          <p className="text-white text-xs font-semibold bg-[#0073E6] rounded-md p-1">ACTIVE</p>
          <p className="text-white text-xs font-semibold bg-[#0073E6] rounded-md p-1">VEHICLE</p>
          <FaLocationArrow className="bg-[#0073E6] rounded-md p-1" size={24} />
        </div>
      </div>
      <div className="p-2 flex justify-center">
        <hr className="w-9/10 text-[#929292]"></hr>
      </div>
      <div className="flex flex-row gap-1 justify-center">
        <NumberedAttachments icon={FaImage} number={1} />
        <NumberedAttachments icon={FaPaintBrush} number={2} />
        <NumberedAttachments icon={FaCamera} number={3} />
        <NumberedAttachments icon={FaMicrophone} number={4} />
        <NumberedAttachments icon={FaFileAlt} number={5} />
      </div>
      <div className="flex flex-row gap-2 justify-center pb-4">
        <div className="flex gap-2 pt-3">
          <button className="flex items-center gap-1 px-3 py-1 bg-[#2D4C7A] text-white rounded-lg text-sm shadow-xl">
            <FaEye className="w-4 h-4" />
            View
          </button>
          <button className="flex items-center justify-center w-8 h-8 bg-[#D9D9D9] text-white rounded-lg shadow-xl">
            <FaPencilAlt className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { data: session } = useSession();

  if(session) {
    redirect("/reports");
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex flex-col w-full items-center bg-[#1B1F3F] pb-8 shadow-xl">
        <Image src="/logo.png" className="p-3" alt="Scribe Logo" width={150} height={150} />
        <div className="flex flex-col items-center justify-center">
          <p className="text-white text-center text-3xl sm:text-4xl md:text-5xl font-thin">On-the-go report creation</p>
          <p className="text-white text-center text-xl font-thin p-4">Never miss a detail</p>
          <MockReport />
        </div>
      </div>
      <p className="text-white rounded-xl text-xl pt-4 text-center">
        Get started today 
      </p>
      <div className="flex flex-col items-center justify-center pt-2 px-4">
        <AuthButton label="Sign up" />
        <hr className="w-5/6 text-[#929292] mt-4"></hr>
        <p className="text-[#929292] text-center text-sm pt-4">Already have an account?</p>
        <AuthButton label="Sign in" />
      </div>
    </main>
  );
}