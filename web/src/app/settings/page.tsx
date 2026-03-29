"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "signalfeed_prefs";

const CATEGORIES = ["AI", "Tech", "Urheilu"] as const;
const LANGUAGES = [
  { value: "all", label: "Kaikki" },
  { value: "fi", label: "Suomi" },
  { value: "en", label: "English" },
] as const;

interface Preferences {
  categories: string[];
  minScore: number;
  language: string;
}

const DEFAULT_PREFS: Preferences = {
  categories: [],
  minScore: 6,
  language: "all",
};

function loadPrefs(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setLoaded(true);
  }, []);

  function toggleCategory(cat: string) {
    setPrefs((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  if (!loaded) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Asetukset</h1>

      {/* Categories */}
      <div className="rounded-2xl bg-surface p-6 mb-6 border border-surface-light/30">
        <h2 className="text-lg font-semibold text-white mb-1">Kategoriat</h2>
        <p className="text-sm text-slate-400 mb-4">
          Valitse kategoriat, joita haluat seurata.
        </p>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => {
            const active = prefs.categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  active
                    ? "bg-brand/20 border-brand text-brand-light shadow-md shadow-brand/10"
                    : "bg-surface-dark border-surface-light/40 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum score */}
      <div className="rounded-2xl bg-surface p-6 mb-6 border border-surface-light/30">
        <h2 className="text-lg font-semibold text-white mb-1">
          Minimipisteet
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Nayta vain artikkelit, joiden pisteet ovat vahintaan:
        </p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={10}
            value={prefs.minScore}
            onChange={(e) =>
              setPrefs((prev) => ({
                ...prev,
                minScore: Number(e.target.value),
              }))
            }
            className="flex-1 h-2 rounded-full appearance-none bg-surface-dark accent-brand cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-brand/30 [&::-webkit-slider-thumb]:transition-shadow
              [&::-webkit-slider-thumb]:hover:shadow-brand/50"
          />
          <span className="text-2xl font-bold text-brand-light tabular-nums w-10 text-center">
            {prefs.minScore}
          </span>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      {/* Language */}
      <div className="rounded-2xl bg-surface p-6 mb-8 border border-surface-light/30">
        <h2 className="text-lg font-semibold text-white mb-1">Kieli</h2>
        <p className="text-sm text-slate-400 mb-4">
          Suodata artikkeleita kielen mukaan.
        </p>
        <div className="flex flex-wrap gap-3">
          {LANGUAGES.map((lang) => {
            const active = prefs.language === lang.value;
            return (
              <button
                key={lang.value}
                onClick={() =>
                  setPrefs((prev) => ({ ...prev, language: lang.value }))
                }
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border flex items-center gap-2 ${
                  active
                    ? "bg-brand/20 border-brand text-brand-light shadow-md shadow-brand/10"
                    : "bg-surface-dark border-surface-light/40 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-full border-2 transition-colors duration-200 ${
                    active ? "border-brand bg-brand" : "border-slate-500"
                  }`}
                />
                {lang.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={save}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand to-purple-500 text-white font-semibold
          shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:scale-[1.01] active:scale-[0.99]
          transition-all duration-200"
      >
        Tallenna asetukset
      </button>

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-emerald-500/90 text-white
          font-medium shadow-lg backdrop-blur-sm transition-all duration-300 ${
            toast
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
      >
        Asetukset tallennettu!
      </div>
    </div>
  );
}
