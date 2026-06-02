import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-xl font-bold">
              CreatorsHub
            </h3>

            <p className="text-zinc-400 mt-3">
              One platform for creators to sell
              everything.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              Explore
            </h4>

            <div className="flex flex-col gap-2 text-zinc-400">
              <Link href="/about">About</Link>
              <Link href="/creators">Creators</Link>
              <Link href="/store">Marketplace</Link>
              <Link href="/search">Search</Link>
              <Link href="/roadmap">Roadmap</Link>
              <Link href="/changelog">Changelog</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              Support
            </h4>

            <div className="flex flex-col gap-2 text-zinc-400">
              <Link href="/contact">Contact</Link>
              <Link href="/roadmap">Suggest a Feature</Link>
              <Link href="/guidelines">Community Guidelines</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              Account
            </h4>

            <div className="flex flex-col gap-2 text-zinc-400">
              <Link href="/favorites">Favorites</Link>
              <Link href="/following">Following</Link>
              <Link href="/cart">Purchase List</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-10 pt-8 flex flex-col md:flex-row md:justify-between gap-4 text-zinc-500 text-sm">
          <p>
            © {new Date().getFullYear()} CreatorsHub
          </p>

          <p>
            Built for creators.
          </p>
        </div>
      </div>
    </footer>
  );
}