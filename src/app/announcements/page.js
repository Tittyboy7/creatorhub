import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/formatDate";
import VerifiedBadge from "@/components/VerifiedBadge";
import FollowButton from "@/components/FollowButton";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const { data: announcements } = await supabase
    .from("announcements")
    .select(`
      *,
      creators (
        id,
        display_name,
        username,
        avatar_url,
        is_verified
      ),
      products (
        id,
        title,
        image_url,
        price
      )
    `)
    .eq("is_active", true)
    .eq("admin_hidden", false)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Creator Announcements
          </p>

          <h1 className="mt-2 text-4xl font-bold md:text-5xl">
            Latest Announcements
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Discover product drops, creator news, launches, and important
            announcements from across CreatorsHub.
          </p>
        </div>

        {!announcements || announcements.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <h2 className="text-2xl font-bold">No announcements yet</h2>

            <p className="mt-2 text-zinc-400">
              Check back later for creator updates.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {announcement.creators && (
                    <Link
                      href={`/creator/${announcement.creators.username}`}
                      className="flex items-center gap-3"
                    >
                      {announcement.creators.avatar_url ? (
                        <img
                          src={announcement.creators.avatar_url}
                          alt={announcement.creators.display_name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-zinc-800" />
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {announcement.creators.display_name}
                          </p>

                          {announcement.creators.is_verified && (
                            <VerifiedBadge />
                          )}
                        </div>

                        <p className="text-sm text-zinc-500">
                          @{announcement.creators.username}
                        </p>

                        <FollowButton creatorId={announcement.creators.id} />
                      </div>
                    </Link>
                  )}

                  <p className="text-sm text-zinc-500">
                    {formatDate(announcement.created_at)}
                  </p>
                </div>

                <div className="mt-5">
                  <h2 className="text-2xl font-bold">
                    {announcement.title}
                  </h2>

                  {announcement.content && (
                    <p className="mt-3 whitespace-pre-wrap leading-relaxed text-zinc-400">
                      {announcement.content}
                    </p>
                  )}
                </div>

                {announcement.products && (
                  <Link
                    href={`/product/${announcement.products.id}`}
                    className="mt-5 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-600 sm:flex-row sm:items-center"
                  >
                    {announcement.products.image_url ? (
                      <img
                        src={announcement.products.image_url}
                        alt={announcement.products.title}
                        className="h-24 w-full rounded-xl object-cover sm:w-32"
                      />
                    ) : (
                      <div className="flex h-24 w-full items-center justify-center rounded-xl bg-zinc-800 text-zinc-500 sm:w-32">
                        Product
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="text-sm text-zinc-500">
                        Linked Product
                      </p>

                      <h3 className="mt-1 font-semibold">
                        {announcement.products.title}
                      </h3>
                    </div>

                    <p className="text-sm font-semibold text-zinc-400">
                      View product →
                    </p>
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}