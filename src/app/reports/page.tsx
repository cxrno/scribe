"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import SignOutButton from "../components/sign-out";
export default function Reports() {
  const { data: session } = useSession();

  if(!session) {
    redirect("/");
  }


  return (
    <div>
      <h1>Reports</h1>
      <p>{session?.user?.name}</p>
      <SignOutButton />
    </div>
  );
}
