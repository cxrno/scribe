import { FaSignOutAlt } from "react-icons/fa";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function SignOutButton() {
    const { data: session } = useSession();

    if(!session) {
        return <p>You are not logged in</p>
    }
    return (
      <button onClick={() => signOut()} className="bg-[#2B2B2B] h-14 text-white rounded-xl w-30 justify-center items-center flex flex-row gap-2 text-xl shadow-2xl mt-2 hover:bg-[#3B3B3B] cursor-pointer">
        <FaSignOutAlt className="w-6 h-6" />
        Sign out
      </button>
    );
  }