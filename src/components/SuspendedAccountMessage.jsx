import Link from "next/link";

export default function SuspendedAccountMessage() {
  return (
    <div className="rounded-3xl border border-red-900 bg-zinc-900 p-8">
      <h1 className="text-4xl font-bold text-red-400">
        Account Suspended
      </h1>

      <p className="mt-4 text-zinc-400">
        Your account has been suspended and creator features have been
        temporarily disabled.
      </p>

      <p className="mt-2 text-zinc-500">
        If you believe this was a mistake, please contact support.
      </p>

      <Link
        href="/"
        className="mt-6 inline-block rounded-2xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 hover:bg-zinc-800"
      >
        Back to Home
      </Link>
    </div>
  );
}