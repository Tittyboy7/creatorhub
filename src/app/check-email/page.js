import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4">Check Your Email</h1>

        <p className="text-zinc-400 mb-8">
          We sent you a confirmation link. Click the link in your email to
          activate your account, then you’ll be able to access your dashboard.
        </p>

        <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-300 rounded-2xl p-4 mb-8 text-sm">
          If you do not see the email within a few minutes, check your spam or
          junk folder.
        </div>

        <Link
          href="/login"
          className="inline-block bg-white text-black px-6 py-3 rounded-2xl font-semibold"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}