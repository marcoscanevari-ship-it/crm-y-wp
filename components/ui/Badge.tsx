const VARIANTS = {
  hot: "bg-red-50 text-red-600",
  warm: "bg-amber-50 text-amber-600",
  cold: "bg-blue-50 text-blue-600",
  neutral: "bg-gray-100 text-gray-500",
  green: "bg-green-50 text-green-600",
  sent: "bg-gray-100 text-gray-500",
  delivered: "bg-blue-50 text-blue-600",
  read: "bg-green-50 text-green-600",
  failed: "bg-red-50 text-red-600",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

const LABELS: Record<BadgeVariant, string> = {
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
  neutral: "Sin calificar",
  green: "OK",
  sent: "Enviado",
  delivered: "Entregado",
  read: "Leído",
  failed: "Falló",
};

export function Badge({
  variant,
  label,
}: {
  variant: BadgeVariant;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${VARIANTS[variant]}`}
    >
      {label ?? LABELS[variant]}
    </span>
  );
}
