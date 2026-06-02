import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">Contact CreatorHub</h1>

        <p className="text-zinc-400 text-lg leading-relaxed mb-6">
          Have feedback, questions, or feature ideas? We’d love to hear from you.
        </p>

        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
          For now, please contact us at:
        </p>

        <a
          href="mailto:tylerrgarvin7@gmail.com"
          className="inline-block bg-white text-black px-6 py-3 rounded-2xl font-semibold"
        >
          Open Email App
        </a>

        <div className="mt-8">
          <Link href="/" className="text-zinc-400 hover:text-white">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}