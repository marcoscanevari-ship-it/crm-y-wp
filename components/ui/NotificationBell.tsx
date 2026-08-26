"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch("/api/notifications/unread-count")
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setCount(data.count ?? 0);
        })
        .catch(() => {});
    };

    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800"
    >
      <Bell size={16} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
