"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Save, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui";
import { useAppData } from "@/components/AppDataProvider";

interface AthleteFormState {
  intervalsId: string;
  fullName: string;
  heightCm: number;
  baselineWeightKg: number;
  targetWeightKg: number;
  criticalPowerW: number;
  lthrBpm: number;
  maxHrBpm: number;
}

const DEFAULT_FADHIL: AthleteFormState = {
  intervalsId: "i655618",
  fullName: "Fadhil Alif",
  heightCm: 180,
  baselineWeightKg: 63.2,
  targetWeightKg: 67.0,
  criticalPowerW: 241,
  lthrBpm: 179,
  maxHrBpm: 204,
};

export default function OnboardingPage() {
  const router = useRouter();
  const { refresh } = useAppData();
  const [form, setForm] = useState<AthleteFormState>(DEFAULT_FADHIL);
  const [wattsPerKg, setWattsPerKg] = useState<number | null>(3.81);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/athletes")
      .then((res) => res.json())
      .then((data) => {
        if (data?.athlete) {
          setForm({
            intervalsId: data.athlete.intervalsId,
            fullName: data.athlete.fullName,
            heightCm: Number(data.athlete.heightCm),
            baselineWeightKg: Number(data.athlete.baselineWeightKg),
            targetWeightKg: Number(data.athlete.targetWeightKg),
            criticalPowerW: Number(data.athlete.criticalPowerW),
            lthrBpm: Number(data.athlete.lthrBpm),
            maxHrBpm: Number(data.athlete.maxHrBpm),
          });
          setWattsPerKg(data.athlete.wattsPerKg ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSyncIntervals() {
    setSyncing(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/athletes/sync-intervals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intervalsId: form.intervalsId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.[0] || data.message || "Gagal sinkronisasi Intervals.icu");
      }
      setForm(data.profile);
      setStatusMsg({
        type: "ok",
        text: `Berhasil menarik profil terbaru (${data.profile.fullName}) dari Intervals.icu! Klik Simpan untuk memperbarui DB.`,
      });
    } catch (err) {
      setStatusMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Gagal terhubung ke Intervals.icu",
      });
    } finally {
      setSyncing(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          heightCm: Number(form.heightCm),
          baselineWeightKg: Number(form.baselineWeightKg),
          targetWeightKg: Number(form.targetWeightKg),
          criticalPowerW: Number(form.criticalPowerW),
          lthrBpm: Number(form.lthrBpm),
          maxHrBpm: Number(form.maxHrBpm),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.[0] || data.message || "Gagal menyimpan profil");
      }
      setWattsPerKg(data.athlete.wattsPerKg);
      refresh();
      setStatusMsg({
        type: "ok",
        text: "Profil berhasil disimpan ke Neon PostgreSQL!",
      });
      setTimeout(() => router.push("/"), 900);
    } catch (err) {
      setStatusMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Gagal menyimpan ke database",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div>
        <p className="text-[10px] font-semibold tracking-[0.18em] text-lime-400 uppercase">
          Dynamic Athlete Setup
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Onboarding & Profil</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Atur parameter fisiologis & target bulking Anda. Tersimpan dinamis di Neon PostgreSQL.
        </p>
      </div>

      <Card title="Quick Actions" glow="lime">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleSyncIntervals}
            disabled={syncing}
            className="min-h-10 rounded-2xl bg-lime-400/15 border border-lime-400/30 text-lime-300 text-xs font-semibold px-3 flex items-center justify-center gap-1.5 hover:bg-lime-400/25 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Menarik..." : "Pull Intervals.icu"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(DEFAULT_FADHIL);
              setStatusMsg({ type: "ok", text: "Preset baseline Fadhil dimuat ke form." });
            }}
            className="min-h-10 rounded-2xl bg-zinc-900 border border-white/[0.08] text-zinc-200 text-xs font-semibold px-3 flex items-center justify-center gap-1.5 hover:bg-zinc-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Preset Default
          </button>
        </div>
      </Card>

      {statusMsg && (
        <div
          className={`rounded-2xl border p-3.5 text-xs flex items-start gap-2 ${
            statusMsg.type === "ok"
              ? "border-lime-400/30 bg-lime-400/10 text-lime-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {statusMsg.type === "ok" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <Card
          title="Identitas & Antropometri"
          glow="cyan"
          right={
            wattsPerKg ? (
              <span className="rounded-full bg-lime-400/15 border border-lime-400/30 px-2.5 py-0.5 text-[11px] font-mono text-lime-300 font-semibold">
                {wattsPerKg} W/kg
              </span>
            ) : null
          }
        >
          {loading ? (
            <p className="text-xs text-zinc-500 py-4">Memuat profil dari Neon DB...</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Intervals Athlete ID</label>
                  <input
                    type="text"
                    required
                    value={form.intervalsId}
                    onChange={(e) => setForm({ ...form, intervalsId: e.target.value })}
                    className="w-full rounded-xl bg-zinc-950 border border-white/[0.08] px-3 py-2 text-sm text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Nama Atlet</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full rounded-xl bg-zinc-950 border border-white/[0.08] px-3 py-2 text-sm text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Tinggi (cm)</label>
                  <input
                    type="number"
                    required
                    value={form.heightCm}
                    onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
                    className="w-full rounded-xl bg-zinc-950 border border-white/[0.08] px-3 py-2 text-sm text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Berat Awal (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.baselineWeightKg}
                    onChange={(e) => setForm({ ...form, baselineWeightKg: Number(e.target.value) })}
                    className="w-full rounded-xl bg-zinc-950 border border-white/[0.08] px-3 py-2 text-sm text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Target Bulk (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.targetWeightKg}
                    onChange={(e) => setForm({ ...form, targetWeightKg: Number(e.target.value) })}
                    className="w-full rounded-xl bg-zinc-950 border border-white/[0.08] px-3 py-2 text-sm text-zinc-100"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card title="Parameter Fisiologis (Norwegian Singles)" glow="purple">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Critical Power (W)</label>
              <input
                type="number"
                required
                value={form.criticalPowerW}
                onChange={(e) => setForm({ ...form, criticalPowerW: Number(e.target.value) })}
                className="w-full rounded-xl bg-zinc-950 border border-white/[0.08] px-3 py-2 text-sm text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">LTHR (bpm)</label>
              <input
                type="number"
                required
                value={form.lthrBpm}
                onChange={(e) => setForm({ ...form, lthrBpm: Number(e.target.value) })}
                className="w-full rounded-xl bg-zinc-950 border border-white/[0.08] px-3 py-2 text-sm text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Max HR (bpm)</label>
              <input
                type="number"
                required
                value={form.maxHrBpm}
                onChange={(e) => setForm({ ...form, maxHrBpm: Number(e.target.value) })}
                className="w-full rounded-xl bg-zinc-950 border border-white/[0.08] px-3 py-2 text-sm text-zinc-100"
              />
            </div>
          </div>
        </Card>

        <button
          type="submit"
          disabled={saving}
          className="w-full min-h-12 rounded-2xl bg-lime-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-lime-300 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "Menyimpan ke Neon DB..." : "Simpan Profil Atlet"}
        </button>
      </form>
    </>
  );
}
