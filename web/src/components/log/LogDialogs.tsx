"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import {
  DAY_TYPE_OPTIONS,
  GYM_SESSION_OPTIONS,
  pickOption,
} from "@/lib/constants";
import { todayJakarta, toLogNo } from "@/lib/date";
import type { DayType, GymSessionCode, LogItemInput } from "@/lib/types";
import { LineItemsEditor } from "./LineItemsEditor";

const INITIAL_ITEMS: LogItemInput[] = [
  { itemCategory: "MEAL_SOLID", itemName: "Pre-run snack", quantity: 1, unitKcalOrLoad: 200, proteinGrams: 4 },
  { itemCategory: "LIQUID_BOOSTER", itemName: "Liquid Booster #1", quantity: 1, unitKcalOrLoad: 560, proteinGrams: 36 },
  { itemCategory: "MEAL_SOLID", itemName: "Lunch double protein", quantity: 1, unitKcalOrLoad: 700, proteinGrams: 45 },
];

export function CreateLogModal({
  isOpen,
  athleteId,
  baselineWeight,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  athleteId: number;
  baselineWeight: number;
  onClose: () => void;
  onCreated: () => void;
}) {
  const maxDate = todayJakarta();
  const [logDate, setLogDate] = useState(maxDate);
  const [logNo, setLogNo] = useState(toLogNo(maxDate));
  const [dayType, setDayType] = useState<DayType>("QUALITY_SUB_T");
  const [gymCode, setGymCode] = useState<GymSessionCode>("GYM_A");
  const [weight, setWeight] = useState(baselineWeight || 63.2);
  const [runBurn, setRunBurn] = useState(550);
  const [surplus, setSurplus] = useState(400);
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<LogItemInput[]>(INITIAL_ITEMS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest("/api/daily-logs", {
        method: "POST",
        body: JSON.stringify({
          logNo: logNo.trim(),
          logDate,
          athleteId,
          dayType,
          gymSessionCode: gymCode,
          morningWeightKg: Number(weight),
          runningBurnKcal: Number(runBurn),
          targetSurplusKcal: Number(surplus),
          remarks: remarks.trim() || undefined,
          items,
        }),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-white/[0.08] bg-[#14161d] p-4 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] sticky top-0 bg-[#14161d] z-10">
          <div>
            <h3 className="font-bold text-base text-zinc-100">+ Catat Log Nutrisi & Gym</h3>
            <p className="text-[11px] text-zinc-400">Tersimpan aman di Neon PostgreSQL</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup dialog"
            className="h-9 w-9 rounded-full border border-white/[0.08] bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-3 rounded-2xl bg-zinc-950/60 border border-white/[0.06] p-3.5">
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] uppercase tracking-wider text-zinc-400">
                Tanggal
                <input
                  required
                  type="date"
                  max={maxDate}
                  value={logDate}
                  onChange={(event) => {
                    setLogDate(event.target.value);
                    setLogNo(toLogNo(event.target.value));
                  }}
                  className="mt-1 min-h-10 w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 text-xs text-zinc-100"
                />
              </label>
              <label className="text-[10px] uppercase tracking-wider text-zinc-400">
                No. Log
                <input
                  required
                  value={logNo}
                  onChange={(event) => setLogNo(event.target.value)}
                  className="mt-1 min-h-10 w-full font-mono rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 text-xs text-zinc-100"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] uppercase tracking-wider text-zinc-400">
                Tipe hari lari
                <select
                  value={dayType}
                  onChange={(event) =>
                    setDayType(pickOption(DAY_TYPE_OPTIONS, event.target.value, "QUALITY_SUB_T"))
                  }
                  className="mt-1 min-h-10 w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 text-xs text-zinc-100"
                >
                  {DAY_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[10px] uppercase tracking-wider text-zinc-400">
                Sesi gym
                <select
                  value={gymCode}
                  onChange={(event) =>
                    setGymCode(pickOption(GYM_SESSION_OPTIONS, event.target.value, "NONE"))
                  }
                  className="mt-1 min-h-10 w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 text-xs text-zinc-100"
                >
                  {GYM_SESSION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-[10px] uppercase tracking-wider text-zinc-400">
                Berat (kg)
                <input
                  required
                  type="number"
                  step={0.1}
                  min={35}
                  value={weight}
                  onChange={(event) => setWeight(Number(event.target.value))}
                  className="mt-1 min-h-10 w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 text-xs text-zinc-100"
                />
              </label>
              <label className="text-[10px] uppercase tracking-wider text-zinc-400">
                Run burn (kkal)
                <input
                  required
                  type="number"
                  min={0}
                  value={runBurn}
                  onChange={(event) => setRunBurn(Number(event.target.value))}
                  className="mt-1 min-h-10 w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 text-xs text-zinc-100"
                />
              </label>
              <label className="text-[10px] uppercase tracking-wider text-zinc-400">
                Surplus (kkal)
                <input
                  required
                  type="number"
                  value={surplus}
                  onChange={(event) => setSurplus(Number(event.target.value))}
                  className="mt-1 min-h-10 w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 text-xs text-zinc-100"
                />
              </label>
            </div>
            <label className="block text-[10px] uppercase tracking-wider text-zinc-400">
              Catatan RPE / Wellness
              <input
                placeholder="Sensasi otot, power lari, atau catatan pemulihan"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                className="mt-1 min-h-10 w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 text-xs text-zinc-100"
              />
            </label>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-300 mb-2">
              Line Items (Makanan & Latihan)
            </h4>
            <LineItemsEditor items={items} onChange={setItems} />
          </div>

          <div className="flex gap-2 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-11 rounded-2xl border border-white/[0.08] bg-zinc-900 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 min-h-11 rounded-2xl bg-lime-400 text-xs font-bold text-zinc-950 hover:bg-lime-300 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteLogModal({
  isOpen,
  logId,
  logNo,
  logDate,
  onClose,
  onDeleted,
}: {
  isOpen: boolean;
  logId: number | null;
  logNo: string;
  logDate: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !logId) return null;

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await apiRequest(`/api/daily-logs/${logId}`, { method: "DELETE" });
      onDeleted();
      onClose();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl border border-white/[0.08] bg-[#14161d] p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Konfirmasi Hapus Log</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup dialog"
            className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-300">Apakah Anda yakin ingin menghapus dokumen transaksi:</p>
        <div className="rounded-2xl bg-zinc-950 border border-white/[0.06] p-3 text-xs">
          <div className="flex justify-between font-mono text-zinc-100">
            <span className="font-bold text-lime-400">{logNo}</span>
            <span className="text-zinc-400">{logDate}</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Seluruh rincian makanan dan set latihan di dalamnya akan ikut dihapus.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20"
          >
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 min-h-10 rounded-2xl border border-white/[0.08] bg-zinc-900 text-xs font-semibold text-zinc-300"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 min-h-10 rounded-2xl bg-rose-600 text-xs font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? "Menghapus..." : "Hapus Log"}
          </button>
        </div>
      </div>
    </div>
  );
}
