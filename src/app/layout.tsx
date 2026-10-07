import type { Metadata } from "next";
import "./globals.css";
import AlarmManager from "@/components/reminder/AlarmManager";

export const metadata: Metadata = {
  title: "RemindFlow - Reminder & Task Management",
  description:
    "Aplikasi pengingat dan manajemen tugas dengan notifikasi serta alarm berbasis browser.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans">
        {children}
        <AlarmManager />
      </body>
    </html>
  );
}
