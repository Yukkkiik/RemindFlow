"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { playTestSound } from "@/utils/sound";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Pengaturan"
          subtitle="Konfigurasi akun, preferensi notifikasi, dan sistem RemindFlow"
        />

        <main className="flex-1 p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pengaturan Aplikasi
          </h1>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Informasi Pengguna
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Akun yang sedang aktif digunakan untuk manajemen tugas
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-medium block mb-1">Nama</span>
                <span className="font-semibold text-slate-800 text-sm">
                  Pengguna RemindFlow
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-medium block mb-1">Email</span>
                <span className="font-semibold text-slate-800 text-sm">
                  user@remindflow.local
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Preferensi Notifikasi & Alarm
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengaturan suara alarm dan izin notifikasi browser
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-900">
                  Izin Notifikasi Web Browser
                </p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Izinkan browser menampilkan popup notifikasi pengingat tugas
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if ("Notification" in window) {
                    const permission = await Notification.requestPermission();
                    alert(`Status izin notifikasi: ${permission}`);
                  } else {
                    alert("Browser Anda tidak mendukung Web Notification API");
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Minta Izin
              </button>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Uji Suara Alarm Audio
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Dengarkan bunyi alarm pengingat berbasis Web Audio synthesizer
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playTestSound();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>🔔</span>
                <span>Tes Suara</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
