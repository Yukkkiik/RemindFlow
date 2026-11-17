"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  mode: "login" | "register";
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600";
const labelClass = "block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5";

export default function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Terjadi kesalahan, coba lagi");
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white items-center justify-center text-xl shadow-lg shadow-indigo-600/20 mb-3">
            ⏰
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isRegister ? "Buat Akun RemindFlow" : "Masuk ke RemindFlow"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isRegister
              ? "Daftar untuk mulai mengelola tugas dan pengingatmu"
              : "Kelola tugas dan pengingat harianmu dengan tepat waktu"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
        >
          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700"
            >
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label htmlFor="name" className={labelClass}>
                Nama
              </label>
              <input
                id="name"
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Nama lengkap"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              maxLength={191}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={isRegister ? 8 : undefined}
              maxLength={72}
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder={isRegister ? "Minimal 8 karakter" : "Password"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Memproses..." : isRegister ? "Daftar" : "Masuk"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            {isRegister ? "Masuk" : "Daftar sekarang"}
          </Link>
        </p>
      </div>
    </div>
  );
}
