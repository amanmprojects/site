"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg
        className="fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 21 19"
        width="19"
        height="19"
        aria-hidden
      >
        <path fillOpacity=".16" d="M4 7v11h13V7l-6.5-5z" />
        <path d="m10.433 3.242-8.837 6.56L.404 8.198l10.02-7.44L20.59 8.194l-1.18 1.614-8.977-6.565ZM16 17V9h2v10H3V9h2v8h11Z" />
      </svg>
    ),
  },
  {
    href: "/writing",
    label: "Writing",
    icon: (
      <svg
        className="fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden
      >
        <path
          fillOpacity=".16"
          fillRule="nonzero"
          d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
        />
      </svg>
    ),
  },
  {
    href: "/stuff",
    label: "Stuff",
    icon: (
      <svg
        className="fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        width="19"
        height="19"
        aria-hidden
      >
        <path fillOpacity=".16" d="M1 4h18v10H1z" />
        <path d="M8 3h4V2H8v1ZM6 3V0h8v3h6v12H0V3h6ZM2 5v8h16V5H2Zm14 13v-2h2v4H2v-4h2v2h12Z" />
      </svg>
    ),
  },
  {
    href: "/guestbook",
    label: "Guestbook",
    icon: (
      <svg
        className="fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 21 21"
        width="19"
        height="19"
        aria-hidden
      >
        <path fillOpacity=".16" d="m13.4 18-3-7.4-7.4-3L19 2z" />
        <path d="M13.331 15.169 17.37 3.63 5.831 7.669l5.337 2.163 2.163 5.337Zm-3.699-3.801L.17 7.53 20.63.37l-7.161 20.461-3.837-9.463Z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      id="site-sidebar"
      className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-line bg-white/70 backdrop-blur-lg md:sticky md:top-0 md:h-screen md:w-40 md:shrink-0 md:border-t-0 md:border-r"
      aria-label="Primary"
    >
      <div className="flex h-full w-full flex-row items-center justify-evenly md:flex-col md:items-start md:justify-start md:gap-1 md:px-5 md:pt-7">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-lg px-2 py-2 transition-[color,background-color,transform] duration-150 active:scale-[0.96] md:w-full md:justify-between md:py-2.5 ${
                active
                  ? "text-blue"
                  : "text-mute hover:bg-black/[0.03] hover:text-ink"
              }`}
            >
              <span className="hidden text-[15px] font-medium md:inline">
                {item.label}
              </span>
              <span className="grid h-5 w-5 shrink-0 place-items-center">
                {item.icon}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
