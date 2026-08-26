"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTransition } from "react";
import { UserPlus, TrendingUp } from "lucide-react";

interface NotificationRow {
  id: string;
  type: "new_contact" | "score_change";
  contact_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

export function NotificationsList({ notifications }: { notifications: NotificationRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const markRead = (id: string) => {
    startTransition(async () => {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      router.refresh();
    });
  };

  const markAllRead = () => {
    startTransition(async () => {
      await fetch("/api/notifications/read-all", { method: "POST" });
      router.refresh();
    });
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Últimas notificaciones</h2>
        {hasUnread && (
          <button
            onClick={markAllRead}
            disabled={isPending}
            className="text-sm text-primary-600 hover:underline disabled:opacity-60"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {notifications.length === 0 && (
          <p className="text-sm text-gray-400 py-6 text-center">No hay notificaciones todavía.</p>
        )}
        {notifications.map((n) => {
          const Icon = n.type === "new_contact" ? UserPlus : TrendingUp;
          const content = (
            <div
              className={`flex items-start gap-3 py-3.5 px-2 -mx-2 rounded-xl transition ${
                n.read ? "" : "bg-primary-50/50"
              } ${n.contact_id ? "hover:bg-gray-50" : ""}`}
            >
              <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? "text-gray-600" : "font-medium text-gray-900"}`}>
                  {n.message}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(n.created_at).toLocaleString("es-AR")}
                </p>
              </div>
              {!n.read && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    markRead(n.id);
                  }}
                  disabled={isPending}
                  className="text-xs text-primary-600 hover:underline shrink-0"
                >
                  Marcar leída
                </button>
              )}
            </div>
          );

          return n.contact_id ? (
            <Link key={n.id} href={`/conversations/${n.contact_id}`}>
              {content}
            </Link>
          ) : (
            <div key={n.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
