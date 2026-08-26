"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Settings as SettingsIcon } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { Badge, type BadgeVariant } from "./Badge";

const today = () =>
  new Date().toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

interface SearchResult {
  id: string;
  name: string | null;
  phone: string;
  score: BadgeVariant | null;
}

export function Topbar({
  title,
  subtitle,
  userEmail,
}: {
  title: string;
  subtitle?: string;
  userEmail?: string | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results ?? []);
          setOpen(true);
        })
        .catch(() => {});
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="relative" ref={containerRef}>
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Buscar contactos..."
              className="pl-9 pr-4 py-2 rounded-xl bg-white shadow-sm text-sm w-56 outline-none focus:ring-2 focus:ring-primary-100"
            />
            {open && results.length > 0 && (
              <div className="absolute top-full mt-2 left-0 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                      router.push(`/conversations/${r.id}`);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-medium text-xs shrink-0">
                      {(r.name ?? r.phone).slice(0, 1).toUpperCase()}
                    </div>
                    <span className="flex-1 min-w-0 truncate text-sm">{r.name ?? r.phone}</span>
                    {r.score && <Badge variant={r.score} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="text-sm text-primary-600 font-medium hidden sm:inline">
            Hoy, {today()}
          </span>
        </div>
        <h1 className="text-2xl font-semibold mt-4">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800"
        >
          <SettingsIcon size={16} />
        </Link>
        <NotificationBell />
        <Link
          href="/profile"
          className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold"
          title={userEmail ?? undefined}
        >
          {(userEmail ?? "U").slice(0, 1).toUpperCase()}
        </Link>
      </div>
    </div>
  );
}
