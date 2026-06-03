import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Terms of Service
        </h1>

        <p className="text-zinc-400 text-lg leading-relaxed mb-6">
          By using CreatorsHub, you agree to use the platform responsibly
          and follow all applicable laws.
        </p>

        <p className="text-zinc-400 text-lg leading-relaxed mb-6">
          Creators are responsible for the products, links, descriptions,
          and content they publish on their storefronts.
        </p>

        <p className="text-zinc-400 text-lg leading-relaxed mb-6">
          CreatorsHub may update, remove, or restrict content that violates
          platform rules or harms the user experience.
        </p>

        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
          These terms may be updated as CreatorsHub continues to grow.
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