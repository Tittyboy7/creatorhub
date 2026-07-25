"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/UserMenu";

const APP_LINKS = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Platforms",
    href: "/platforms",
  },
  {
    label: "Revenue",
    href: "/revenue",
  },
  {
    label: "Compare",
    href: "/compare",
  },
  {
    label: "Products",
    href: "/dashboard/products",
  },
];

function isActiveRoute(pathname, href) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="m16 16 4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
    >
      <path
        d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10 20h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="
        relative
        flex
        h-10
        w-10
        items-center
        justify-center
        overflow-hidden
        rounded-2xl
        border
        border-rose-500/25
        bg-rose-500/10
        text-rose-300
        shadow-[0_0_24px_rgba(244,63,94,0.12)]
      "
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
      >
        <path
          d="M3 12h3l2-5 3 10 3-7 2 4h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function AppNavbar({
  user,
  notificationCount = 0,
  notificationLabel,
  purchaseListLabel,
  isAdmin = false,
  userMenuOpen,
  setUserMenuOpen,
  userMenuRef,
  onLogout,
  menuOpen,
  setMenuOpen,
  onCloseMenu,
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] max-w-[1480px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          onClick={onCloseMenu}
          className="flex shrink-0 items-center gap-3"
        >
          <BrandMark />

          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              CreatorsHub
            </p>

            <p className="text-[11px] text-zinc-500">
              Creator Operating System
            </p>
          </div>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-stretch justify-center self-stretch lg:flex">
          {APP_LINKS.map((link) => {
            const isActive = isActiveRoute(
              pathname,
              link.href
            );

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative
                  flex
                  items-center
                  px-4
                  text-sm
                  font-medium
                  transition
                  ${
                    isActive
                      ? "text-white"
                      : "text-zinc-400 hover:text-white"
                  }
                `}
              >
                {link.label}

                <span
                  aria-hidden="true"
                  className={`
                    absolute
                    inset-x-4
                    bottom-0
                    h-0.5
                    rounded-full
                    bg-rose-500
                    shadow-[0_0_12px_rgba(244,63,94,0.65)]
                    transition
                    ${
                      isActive
                        ? "scale-x-100 opacity-100"
                        : "scale-x-0 opacity-0"
                    }
                  `}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Link
            href="/search"
            aria-label="Search"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-zinc-400
              transition
              hover:bg-zinc-900
              hover:text-white
            "
          >
            <SearchIcon />
          </Link>

          <Link
            href="/notifications"
            aria-label={
              notificationCount > 0
                ? `${notificationCount} unread notifications`
                : "Notifications"
            }
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-zinc-400
              transition
              hover:bg-zinc-900
              hover:text-white
            "
          >
            <NotificationIcon />

            {notificationCount > 0 ? (
              <span
                className="
                  absolute
                  right-0
                  top-0
                  flex
                  min-h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-zinc-950
                  bg-rose-500
                  px-1
                  text-[10px]
                  font-bold
                  text-white
                "
              >
                {notificationCount > 99
                  ? "99+"
                  : notificationCount}
              </span>
            ) : null}
          </Link>

          <div
            ref={userMenuRef}
            className="relative ml-1"
          >
            <button
              type="button"
              onClick={() =>
                setUserMenuOpen(!userMenuOpen)
              }
              className="
                flex
                min-h-11
                items-center
                gap-3
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-900/70
                px-3
                py-2
                text-left
                transition
                hover:border-zinc-700
                hover:bg-zinc-900
              "
            >
              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-zinc-700
                  bg-zinc-800
                  text-xs
                  font-bold
                  uppercase
                  text-white
                "
              >
                {user?.email?.slice(0, 1) || "C"}
              </span>

              <span className="max-w-36 min-w-0">
                <span className="block truncate text-sm font-semibold text-white">
                  {user?.email?.split("@")[0] ||
                    "Creator"}
                </span>

                <span className="block text-[11px] text-zinc-500">
                  Creator
                </span>
              </span>

              <span
                aria-hidden="true"
                className={`text-xs text-zinc-500 transition ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {userMenuOpen ? (
              <div className="absolute right-0 z-50 mt-3 w-64">
                <UserMenu
                  userEmail={user?.email}
                  notificationLabel={
                    notificationLabel
                  }
                  purchaseListLabel={
                    purchaseListLabel
                  }
                  isAdmin={isAdmin}
                  onLogout={onLogout}
                />
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="
            inline-flex
            items-center
            justify-center
            rounded-xl
            border
            border-zinc-700
            px-4
            py-2
            text-sm
            font-semibold
            text-zinc-200
            lg:hidden
          "
        >
          {menuOpen ? "Close ✕" : "Menu ☰"}
        </button>
      </div>

      {menuOpen ? (
        <nav className="max-h-[calc(100vh-72px)] space-y-2 overflow-y-auto border-t border-zinc-800 px-4 py-4 sm:px-6 lg:hidden">
          {APP_LINKS.map((link) => {
            const isActive = isActiveRoute(
              pathname,
              link.href
            );

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onCloseMenu}
                className={`
                  block
                  rounded-2xl
                  border
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  transition
                  ${
                    isActive
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                      : "border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-800 pt-4">
            <Link
              href="/notifications"
              onClick={onCloseMenu}
              className="rounded-2xl border border-zinc-800 p-3 text-center text-sm font-semibold text-zinc-300"
            >
              Notifications
              {notificationCount > 0
                ? ` (${notificationCount})`
                : ""}
            </Link>

            <Link
              href="/search"
              onClick={onCloseMenu}
              className="rounded-2xl border border-zinc-800 p-3 text-center text-sm font-semibold text-zinc-300"
            >
              Search
            </Link>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="mt-2 w-full rounded-2xl bg-white p-3 text-left text-sm font-semibold text-black"
          >
            Log out
          </button>
        </nav>
      ) : null}
    </header>
  );
}