'use client'

import Link from "next/link"
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"
import { CiHome } from "react-icons/ci";
import { FaUserAstronaut } from "react-icons/fa";



export default function Navbar() {
    const router = useRouter();

    const handleLogout = async() => {
        await fetch('api/auth/logout',{method:'POST'})
        toast.success('Logged out!')
        router.push('/login')
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-3 flex items-center justify-between">
            <Link href="/feed" className="text-base font-medium text-neutral-900 dark:text-white p-3">
        <p className="text-xl">Social<span className="text-teal-500">Connect</span></p>
      </Link>

      <div className="flex items-center gap-8">
        <Link href="/feed" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <CiHome size={25}/>
        </Link>
        <Link href="/profile/me" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <FaUserAstronaut size={20}/>
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
        </nav>
    )
}