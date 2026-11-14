"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!passphrase.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Passphrase salah");
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/[0.08] bg-[#14161d]/95 p-6 shadow-2xl shadow-black/80 backdrop-blur-xl relative overflow-hidden before:pointer-events-none before:absolute before:-right-12 before:-top-12 before:h-36 before:w-36 before:rounded-full before:bg-lime-400/15 before:blur-2xl">
        <div className="relative z-10 text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-400">
            <Lock className="h-6 w-6 stroke-[2.2]" />
          </div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-lime-400 uppercase">
            Sistem Terproteksi
          </p>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 mt-1">
            Daily Athlete OS
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Masukkan passphrase atlet untuk membuka akses cockpit.
          </p>
        </div>

        <form onSubmit={handleLogin} className="relative z-10 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
              Passphrase
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Masukkan passphrase..."
                className="w-full rounded-2xl border border-white/[0.08] bg-zinc-950/80 px-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400/40"
              />
              <KeyRound className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-600" />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-11 rounded-2xl bg-lime-400 text-zinc-950 font-bold text-xs hover:bg-lime-300 disabled:opacity-50 transition-all shadow-md shadow-lime-400/20 flex items-center justify-center gap-1.5"
          >
            {loading ? "Memverifikasi..." : "Masuk ke Sistem"}
          </button>
        </form>

        <div className="relative z-10 mt-6 pt-4 border-t border-white/[0.06] text-center">
          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
            End-to-End Cookie-Encrypted Session
          </span>
        </div>
      </div>
    </div>
  );
}
