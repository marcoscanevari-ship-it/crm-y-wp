import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function StatCard({
  label,
  value,
  delta,
  deltaPositive = true,
  hint,
  highlight = false,
  href,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  hint?: string;
  highlight?: boolean;
  href?: string;
}) {
  const className = `block rounded-2xl p-5 shadow-sm transition ${
    highlight ? "bg-indigo-600 text-white" : "bg-white text-gray-900"
  } ${href ? "hover:shadow-md cursor-pointer" : ""}`;

  const content = (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm ${highlight ? "text-indigo-100" : "text-gray-500"}`}>
          {label}
        </span>
        <ArrowUpRight
          size={16}
          className={highlight ? "text-indigo-100" : "text-gray-400"}
        />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold">{value}</span>
        {delta && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded-md mb-1 ${
              deltaPositive
                ? highlight
                  ? "bg-white/20 text-white"
                  : "bg-green-50 text-green-600"
                : highlight
                  ? "bg-white/20 text-white"
                  : "bg-red-50 text-red-600"
            }`}
          >
            {delta}
          </span>
        )}
      </div>
      {hint && (
        <p className={`text-xs mt-1 ${highlight ? "text-indigo-100" : "text-gray-400"}`}>
          {hint}
        </p>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
