import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          Privacy Policy
        </h1>

        <p className="text-zinc-400 text-lg leading-relaxed mb-6">
          CreatorHub respects your privacy and is committed to protecting
          your personal information.
        </p>

        <p className="text-zinc-400 text-lg leading-relaxed mb-6">
          We collect information necessary to provide our services,
          including account information, creator profiles, storefront data,
          and platform activity.
        </p>

        <p className="text-zinc-400 text-lg leading-relaxed mb-6">
          We do not sell your personal information. Information is used
          to operate, improve, and secure the platform.
        </p>

        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
          This policy may be updated as CreatorHub evolves.
        </p>

        <Link
          href="/"
          className="inline-block bg-white text-black px-6 py-3 rounded-2xl font-semibold"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}