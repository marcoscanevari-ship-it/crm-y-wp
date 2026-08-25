import { Bell, Search, Settings as SettingsIcon } from "lucide-react";

const today = () =>
  new Date().toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

export function Topbar({
  title,
  subtitle,
  userEmail,
}: {
  title: string;
  subtitle?: string;
  userEmail?: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 rounded-xl bg-white shadow-sm text-sm w-56 outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <span className="text-sm text-indigo-600 font-medium hidden sm:inline">
            Hoy, {today()}
          </span>
        </div>
        <h1 className="text-2xl font-semibold mt-4">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800">
          <SettingsIcon size={16} />
        </button>
        <button className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800">
          <Bell size={16} />
        </button>
        <div
          className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold"
          title={userEmail ?? undefined}
        >
          {(userEmail ?? "U").slice(0, 1).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
