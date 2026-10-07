"use client";

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  colorScheme: "indigo" | "emerald" | "amber" | "rose" | "blue";
  description?: string;
}

const colorSchemes = {
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
    badge: "bg-indigo-100/80 text-indigo-700",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    badge: "bg-emerald-100/80 text-emerald-700",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
    badge: "bg-amber-100/80 text-amber-700",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
    badge: "bg-rose-100/80 text-rose-700",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    badge: "bg-blue-100/80 text-blue-700",
  },
};

export default function StatCard({
  title,
  value,
  icon,
  colorScheme,
  description,
}: StatCardProps) {
  const scheme = colorSchemes[colorScheme];

  return (
    <div
      className={`p-5 rounded-2xl bg-white border ${scheme.border} shadow-xs transition-all hover:shadow-md flex items-start justify-between`}
    >
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
          {value}
        </p>
        {description && (
          <p className="text-xs text-slate-400 mt-1 font-medium">{description}</p>
        )}
      </div>

      <div
        className={`w-12 h-12 rounded-xl ${scheme.bg} ${scheme.text} flex items-center justify-center text-xl shadow-xs`}
      >
        {icon}
      </div>
    </div>
  );
}
