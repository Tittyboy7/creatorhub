"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [username, setUsername] = useState(null);

  useEffect(() => {
    async function getCreatorUsername() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("creators")
        .select("username")
        .eq("user_id", user.id)
        .single();

      if (data?.username) {
        setUsername(data.username);
      }
    }

    getCreatorUsername();
  }, []);

  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/products", label: "Products" },
    { href: "/dashboard/announcements", label: "Announcements" },
    { href: "/revenue", label: "Revenue" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">CreatorsHub Dashboard</h1>

            <div className="flex gap-2">
              <Link
                href="/"
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                creatorshub.me
              </Link>

              {username && (
                <Link
                  href={`/creator/${username}`}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
                >
                  View profile
                </Link>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href === "/revenue" && pathname.startsWith("/revenue"));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-4 py-2 text-center text-sm transition ${
                    isActive
                      ? "bg-white text-black"
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}