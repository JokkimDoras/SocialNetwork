import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <Toaster />
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}