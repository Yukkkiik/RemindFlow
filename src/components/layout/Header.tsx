"use client";

import { useState } from "react";
import { playTestSound } from "@/utils/sound";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({
  title = "Dashboard",
  subtitle = "Kelola tugas dan pengingat harianmu dengan tepat waktu",
}: HeaderProps) {
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const handleTestAlarm = async () => {
    // Request notification permission if default
    if ("Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.error(e);
      }
    }

    // Play synthesized test chime
    const played = playTestSound();
    if (played) {
      setTestStatus("Suara Berbunyi! 🔔");
      setTimeout(() => setTestStatus(null), 2500);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Interactive Alarm / Notification Status button */}
        <button
          type="button"
          onClick={handleTestAlarm}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-xs text-indigo-700 font-semibold border border-indigo-200 transition-all shadow-xs cursor-pointer"
          title="Klik untuk menguji bunyi alarm & mengaktifkan izin notifikasi"
        >
          <span className="text-sm">🔔</span>
          <span>{testStatus || "Tes Suara Alarm"}</span>
        </button>

        {/* User avatar mockup */}
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs shadow-xs">
          RF
        </div>
      </div>
    </header>
  );
}
