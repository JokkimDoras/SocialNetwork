'use client'

import Link from "next/link"
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast"
import { CiHome } from "react-icons/ci";
import { FaUserAstronaut } from "react-icons/fa";
import { useState,useEffect } from "react";


export default function Navbar() {
  const router = useRouter();
  const [userId,setUserId] = useState<string | null>(null);
  

    useEffect(() => {
      const getUser = async () => {
        const res = await fetch('/api/users/me')
        const data = await res.json()
        if (data.user) setUserId(data.user.id)
      }
      getUser()
    }, [])

    const handleLogout = async() => {
        await fetch('api/auth/logout',{method:'POST'})
        toast.success('Logged out!')
        router.push('/login')
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-3 flex items-center justify-between">
            <Link href="/feed" className="text-base font-medium text-neutral-900 dark:text-white p-3">
        <p className="text-xl">Social<span className="text-teal-500">Network</span></p>
      </Link>

      <div className="flex items-center gap-8">
        <Link href="/feed" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <CiHome size={25}/>
        </Link>
        <Link href={userId?`profile/${userId}`:'/profileerror'} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
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