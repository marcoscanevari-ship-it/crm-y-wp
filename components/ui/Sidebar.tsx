"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  FlaskConical,
  Waves,
  LogOut,
  Users,
} from "lucide-react";
import { signOutAction } from "@/app/(app)/actions";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", adminOnly: false },
  { href: "/conversations", icon: MessageSquare, label: "Conversaciones", adminOnly: false },
  { href: "/clientes", icon: Users, label: "Base de clientes", adminOnly: false },
  { href: "/settings", icon: Settings, label: "Configuración", adminOnly: true },
  { href: "/test-chat", icon: FlaskConical, label: "Test chat", adminOnly: true },
];

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="flex flex-col items-center justify-between w-[72px] shrink-0 py-5 bg-white rounded-3xl shadow-sm h-[calc(100vh-2.5rem)] sticky top-5">
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
          <Waves size={18} />
        </div>

        <nav className="flex flex-col items-center gap-2 w-full">
          {items.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                <Icon size={18} />
              </Link>
            );
          })}
        </nav>
      </div>

      <form action={signOutAction}>
        <button
          type="submit"
          title="Cerrar sesión"
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
        >
          <LogOut size={18} />
        </button>
      </form>
    </aside>
  );
}
