import Link from "next/link"

// ⚠️ This line is the fix. It tells Next.js to skip static generation for this page.
export const dynamic = "force-dynamic"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 text-center">
      <h1 className="text-6xl font-extrabold text-emerald-500">404</h1>
      <h2 className="text-2xl font-bold mt-4">Page Not Found</h2>
      <p className="mt-2 text-[var(--muted-foreground)] max-w-md mx-auto">
        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      
      <Link 
        href="/" 
        className="mt-8 px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold hover:opacity-90 transition-all"
      >
        Return Home
      </Link>
    </div>
  )
}