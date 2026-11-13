"use client";

import { Plus, Sparkles, Trash2 } from "lucide-react";
import { ITEM_CATEGORY_OPTIONS, pickOption } from "@/lib/constants";
import type { ItemCategory, LogItemInput } from "@/lib/types";

const EMPTY_ITEM: LogItemInput = {
  itemCategory: "MEAL_SOLID",
  itemName: "",
  quantity: 1,
  unitKcalOrLoad: 250,
  proteinGrams: 10,
};

const PRESET_5_MEALS: LogItemInput[] = [
  { itemCategory: "MEAL_SOLID", itemName: "Pre-run: pisang + roti", quantity: 1, unitKcalOrLoad: 200, proteinGrams: 4 },
  { itemCategory: "LIQUID_BOOSTER", itemName: "Liquid Booster #1: UHT + whey + oat + peanut butter", quantity: 1, unitKcalOrLoad: 560, proteinGrams: 36 },
  { itemCategory: "MEAL_SOLID", itemName: "Lunch: nasi + ayam + sayur", quantity: 1, unitKcalOrLoad: 680, proteinGrams: 42 },
  { itemCategory: "LIQUID_BOOSTER", itemName: "Liquid Booster #2: susu + pisang + oat", quantity: 1, unitKcalOrLoad: 480, proteinGrams: 18 },
  { itemCategory: "MEAL_SOLID", itemName: "Dinner: nasi + protein + sayur", quantity: 1, unitKcalOrLoad: 720, proteinGrams: 38 },
];

interface LineItemsEditorProps {
  items: LogItemInput[];
  onChange: (items: LogItemInput[]) => void;
}

export function LineItemsEditor({ items, onChange }: LineItemsEditorProps) {
  function update(index: number, patch: Partial<LogItemInput>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(PRESET_5_MEALS.map((item) => ({ ...item })))}
          className="flex min-h-9 items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/15 px-3.5 text-xs font-semibold text-lime-300 hover:bg-lime-400/25 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Muat preset 5 meal
        </button>
        <button
          type="button"
          onClick={() => onChange([...items, { ...EMPTY_ITEM }])}
          className="flex min-h-9 items-center gap-1 rounded-full border border-white/[0.08] bg-zinc-900 px-3.5 text-xs font-semibold text-zinc-300 hover:border-white/[0.18] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah item
        </button>
      </div>

      {items.map((item, index) => (
        <fieldset
          key={index}
          className="space-y-2 rounded-2xl border border-white/[0.07] bg-zinc-950/70 p-3"
        >
          <div className="flex gap-2">
            <select
              aria-label={`Kategori item ${index + 1}`}
              value={item.itemCategory}
              onChange={(event) =>
                update(index, {
                  itemCategory: pickOption(
                    ITEM_CATEGORY_OPTIONS,
                    event.target.value,
                    "MEAL_SOLID",
                  ),
                })
              }
              className="min-h-10 min-w-0 rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 text-xs text-zinc-200"
            >
              {ITEM_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              required
              minLength={3}
              maxLength={100}
              aria-label={`Nama item ${index + 1}`}
              placeholder="Nama makanan atau gerakan"
              value={item.itemName}
              onChange={(event) => update(index, { itemName: event.target.value })}
              className="min-h-10 min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 text-xs text-zinc-100"
            />
            <button
              type="button"
              aria-label={`Hapus item ${index + 1}`}
              disabled={items.length <= 1}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="min-h-10 min-w-10 rounded-xl text-zinc-500 hover:text-rose-400 disabled:opacity-30"
            >
              <Trash2 className="mx-auto h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-[10px] text-zinc-400">
              Qty (int)
              <input
                required
                type="number"
                min={1}
                step={1}
                value={item.quantity}
                onChange={(event) => update(index, { quantity: Number(event.target.value) })}
                className="mt-1 min-h-10 w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 text-sm text-zinc-100"
              />
            </label>
            <label className="text-[10px] text-zinc-400">
              {item.itemCategory === "GYM_SET" ? "Load / set (kg)" : "Kcal / porsi"}
              <input
                required
                type="number"
                min={0.01}
                step={0.1}
                value={item.unitKcalOrLoad}
                onChange={(event) => update(index, { unitKcalOrLoad: Number(event.target.value) })}
                className="mt-1 min-h-10 w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 text-sm text-zinc-100"
              />
            </label>
            <label className="text-[10px] text-zinc-400">
              Protein / unit (g)
              <input
                required
                type="number"
                min={0}
                step={0.1}
                value={item.proteinGrams}
                onChange={(event) => update(index, { proteinGrams: Number(event.target.value) })}
                className="mt-1 min-h-10 w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 text-sm text-zinc-100"
              />
            </label>
          </div>
        </fieldset>
      ))}
      {items.some((item) => item.itemCategory === ("GYM_SET" satisfies ItemCategory)) && (
        <p className="text-[11px] text-amber-300">
          Beban gym dicatat sebagai line item; subtotal kalori/protein tidak dihitung untuk GYM_SET.
        </p>
      )}
    </div>
  );
}
