'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ identity: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const isEmail = form.identity.includes('@')
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [isEmail ? 'email' : 'username']: form.identity,
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Welcome back!')
      router.push('/feed')
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl min-h-[520px] flex rounded-2xl overflow-hidden shadow-sm border border-neutral-200 dark:border-neutral-800">
      <Toaster />

      {/* Left Panel */}
      <div className="hidden md:flex flex-col justify-center flex-1 bg-neutral-950 p-10">
        <div className="text-2xl font-medium text-white mb-2">
          Social<span className="text-teal-400">Network</span>
        </div>
        <p className="text-2xl font-medium text-white leading-snug mt-6 mb-3">
          Connect, share,<br />and discover.
        </p>
        <p className="text-sm text-neutral-400 mb-8">A social platform built for real connections.</p>
        {['Share posts & images', 'Like & comment', 'Personalised feed', 'Follow people you love'].map((f) => (
          <div key={f} className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
            {f}
          </div>
        ))}
      </div>

      {/* Right Panel */}
      <div className="flex flex-col justify-center flex-1 bg-white dark:bg-neutral-900 p-10">
        {/* Tabs */}
        <div className="flex rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 mb-6">
          <div className="flex-1 text-center py-2 text-sm font-medium bg-neutral-950 text-white">
            Sign in
          </div>
          <Link
            href="/register"
            className="flex-1 text-center py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Create account
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Email or username</label>
            <input
              name="identity"
              type="text"
              placeholder="you@example.com"
              value={form.identity}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="text-center text-xs text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-neutral-900 dark:text-white font-medium">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}