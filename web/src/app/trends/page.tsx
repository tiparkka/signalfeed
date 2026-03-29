"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface TagCount {
  tag: string;
  count: number;
}

interface CategoryCount {
  category: string;
  count: number;
  percentage: number;
}

interface SourceCount {
  name: string;
  count: number;
}

interface DailyVolume {
  date: string;
  dayLabel: string;
  count: number;
}

const DAY_LABELS = ["su", "ma", "ti", "ke", "to", "pe", "la"];

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  ai: { bg: "bg-purple-500/15", border: "border-purple-500/30", text: "text-purple-400" },
  tech: { bg: "bg-blue-500/15", border: "border-blue-500/30", text: "text-blue-400" },
  urheilu: { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-400" },
};

const CATEGORY_LABELS: Record<string, string> = {
  ai: "AI",
  tech: "Tech",
  urheilu: "Urheilu",
};

export default function TrendsPage() {
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<TagCount[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [sources, setSources] = useState<SourceCount[]>([]);
  const [dailyVolume, setDailyVolume] = useState<DailyVolume[]>([]);

  useEffect(() => {
    fetchTrends();
  }, []);

  async function fetchTrends() {
    setLoading(true);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const since = sevenDaysAgo.toISOString();

    // Fetch curated articles with tags from last 7 days
    const { data: curatedData } = await supabase
      .from("curated_articles")
      .select("tags, relevance_score, curated_at, article_id")
      .gte("curated_at", since);

    // Fetch articles with sources from last 7 days
    const { data: articlesData } = await supabase
      .from("articles")
      .select("id, title, published_at, source_id, sources (name, category)")
      .gte("published_at", since);

    // 1. Rising topics - count tags
    const tagMap = new Map<string, number>();
    (curatedData || []).forEach((item) => {
      (item.tags || []).forEach((tag: string) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    const sortedTags = Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
    setTags(sortedTags);

    // 2. Category distribution
    const catMap = new Map<string, number>();
    (articlesData || []).forEach((item: any) => {
      const cat = item.sources?.category;
      if (cat) {
        catMap.set(cat, (catMap.get(cat) || 0) + 1);
      }
    });
    const totalArticles = Array.from(catMap.values()).reduce((a, b) => a + b, 0);
    const categoryList = ["ai", "tech", "urheilu"]
      .map((cat) => ({
        category: cat,
        count: catMap.get(cat) || 0,
        percentage: totalArticles > 0 ? Math.round(((catMap.get(cat) || 0) / totalArticles) * 100) : 0,
      }));
    setCategories(categoryList);

    // 3. Most active sources
    const sourceMap = new Map<string, number>();
    (articlesData || []).forEach((item: any) => {
      const name = item.sources?.name;
      if (name) {
        sourceMap.set(name, (sourceMap.get(name) || 0) + 1);
      }
    });
    const sortedSources = Array.from(sourceMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    setSources(sortedSources);

    // 4. Daily volume
    const dayMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, 0);
    }
    (articlesData || []).forEach((item: any) => {
      if (item.published_at) {
        const key = item.published_at.slice(0, 10);
        if (dayMap.has(key)) {
          dayMap.set(key, (dayMap.get(key) || 0) + 1);
        }
      }
    });
    const volume = Array.from(dayMap.entries()).map(([date, count]) => {
      const d = new Date(date);
      return {
        date,
        dayLabel: DAY_LABELS[d.getDay()],
        count,
      };
    });
    setDailyVolume(volume);

    setLoading(false);
  }

  const maxTagCount = tags.length > 0 ? tags[0].count : 1;
  const maxDailyCount = dailyVolume.length > 0 ? Math.max(...dailyVolume.map((d) => d.count), 1) : 1;

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-6">Trendit</h1>
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl p-6 border border-surface-light/30 animate-shimmer">
              <div className="h-6 bg-surface-light/20 rounded-lg w-1/3 mb-4" />
              <div className="h-4 bg-surface-light/10 rounded-lg w-full mb-2" />
              <div className="h-4 bg-surface-light/10 rounded-lg w-2/3 mb-2" />
              <div className="h-4 bg-surface-light/10 rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Trendit</h1>
        <span className="text-sm text-slate-500">Viimeiset 7 paivaa</span>
      </div>

      <div className="grid gap-6">
        {/* 1. Nousevat aiheet */}
        <section className="bg-surface rounded-2xl p-6 border border-surface-light/30 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Nousevat aiheet
          </h2>
          {tags.length === 0 ? (
            <p className="text-slate-500 text-sm">Ei dataa.</p>
          ) : (
            <div className="space-y-2.5">
              {tags.map((t, i) => (
                <div key={t.tag} className="flex items-center gap-3" style={{ animationDelay: `${i * 30}ms` }}>
                  <span className="text-sm text-slate-400 w-36 truncate shrink-0">{t.tag}</span>
                  <div className="flex-1 h-7 bg-surface-dark rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-brand to-brand-light transition-all duration-500"
                      style={{ width: `${Math.max((t.count / maxTagCount) * 100, 4)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white w-10 text-right shrink-0">{t.count}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. Kategoria-jakauma */}
        <section className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Kategoria-jakauma
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const colors = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.tech;
              return (
                <div
                  key={cat.category}
                  className={`rounded-2xl p-5 border ${colors.bg} ${colors.border}`}
                >
                  <p className={`text-sm font-medium ${colors.text} mb-1`}>
                    {CATEGORY_LABELS[cat.category] || cat.category}
                  </p>
                  <p className="text-3xl font-bold text-white">{cat.percentage}%</p>
                  <p className="text-sm text-slate-500 mt-1">{cat.count} artikkelia</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Aktiivisimmat lahteet */}
        <section className="bg-surface rounded-2xl p-6 border border-surface-light/30 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Aktiivisimmat lahteet
          </h2>
          {sources.length === 0 ? (
            <p className="text-slate-500 text-sm">Ei dataa.</p>
          ) : (
            <div className="divide-y divide-surface-light/20">
              {sources.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-600 w-6 text-right">{i + 1}.</span>
                    <span className="text-sm text-white">{s.name}</span>
                  </div>
                  <span className="text-sm font-medium text-brand-light">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. Paivittainen volyymi */}
        <section className="bg-surface rounded-2xl p-6 border border-surface-light/30 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Paivittainen volyymi
          </h2>
          <div className="flex items-end gap-2 h-40">
            {dailyVolume.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium">{d.count}</span>
                <div className="w-full bg-surface-dark rounded-lg overflow-hidden" style={{ height: "100px" }}>
                  <div className="w-full flex items-end h-full">
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-brand to-brand-light transition-all duration-500"
                      style={{ height: `${Math.max((d.count / maxDailyCount) * 100, 3)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium uppercase">{d.dayLabel}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
