import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm uppercase tracking-[0.22em] text-amber-200/70">404</p>
      <h1 className="font-heading mt-2 text-4xl text-neutral-100">Page Not Found</h1>
      <p className="mt-3 text-neutral-400">
        The requested campaign resource does not exist or you do not have access.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex h-10 items-center rounded-md bg-amber-500 px-4 text-sm font-medium text-neutral-950 hover:bg-amber-400"
      >
        Back to Dashboard
      </Link>
    </main>
  );
}
