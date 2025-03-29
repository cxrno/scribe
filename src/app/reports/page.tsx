"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import SignOutButton from "../components/sign-out";
import { FaPlusCircle } from "react-icons/fa";
import Image from "next/image";

function NewReportButton() {
  return (
    <button className = "bg-[#0073E6] w-20 h-12 flex flex-row items-center justify-center gap-2 rounded-lg"> 
    <FaPlusCircle className = "w-5 h-5" />
    New
    </button>
  )
}
function ReportsHeader() {
  return (
    <div className = "p-6 bg-[#1B1F3F] flex flex-row justify-between">
      <Image src="/logo.png" alt="logo" width={120} height={100} />
      <h1 className = "text-white text-2xl text-center mt-2">Reports</h1>
      <NewReportButton />
    </div>
  );
}

function TagSearch() {
  return (
    <div className = "flex flex-row justify-between mt-6 ml-6 mr-6 rounded-lg bg-[#1B1F3F]">
      <input type="text" className = "bg-[#282434] text-white rounded-lg p-2" placeholder="Search by tag" />
    </div>
  );
}

export default function Reports() {
  const { data: session } = useSession();

  if(!session) {
    redirect("/");
  }

  return (
    <div>
      <ReportsHeader />
      <TagSearch />
      <p>{session?.user?.name}</p>
      <SignOutButton />
    </div>
  );
}
