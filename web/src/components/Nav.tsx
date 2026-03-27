"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Etusivu" },
  { href: "/feed", label: "Feed" },
  { href: "/archive", label: "Arkisto" },
  { href: "/sources", label: "Lähteet" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-surface-light bg-surface-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <span className="font-semibold text-white text-lg">SignalFeed</span>
        </Link>
        <nav className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === link.href
                  ? "bg-brand text-white"
                  : "text-slate-400 hover:text-white hover:bg-surface"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
