export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-950 p-4">
        {children}
      </main>
    )
  }