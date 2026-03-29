"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ArticleCard from "@/components/ArticleCard";

interface CuratedArticle {
  id: string;
  relevance_score: number;
  tags: string[];
  summary_fi: string;
  articles: {
    title: string;
    url: string;
    published_at: string | null;
    sources: { name: string; category: string; language: string } | null;
  };
}

export default function FeedPage() {
  const [articles, setArticles] = useState<CuratedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [minScore, setMinScore] = useState(6);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchArticles();
  }, [category, minScore, page]);

  async function fetchArticles() {
    setLoading(true);
    let query = supabase
      .from("curated_articles")
      .select(`
        id,
        relevance_score,
        tags,
        summary_fi,
        articles (
          title, url, published_at,
          sources (name, category, language)
        )
      `)
      .not("summary_fi", "is", null)
      .gte("relevance_score", minScore)
      .order("relevance_score", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data } = await query;

    const { count } = await supabase
      .from("curated_articles")
      .select("*", { count: "exact", head: true })
      .not("summary_fi", "is", null)
      .gte("relevance_score", minScore);

    setArticles((data as any) || []);
    setTotalCount(count || 0);
    setLoading(false);
  }

  const filtered = articles.filter((a) => {
    if (category !== "all") {
      const cat = a.articles?.sources?.category;
      if (cat !== category) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const title = a.articles?.title?.toLowerCase() || "";
      const summary = a.summary_fi?.toLowerCase() || "";
      if (!title.includes(q) && !summary.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Feed</h1>
        <span className="text-sm text-slate-500">{totalCount} artikkelia</span>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-2xl p-4 border border-surface-light/30 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Hae artikkeleista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-dark border border-surface-light/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
          />
        </div>

        <div className="flex gap-2">
          {["all", "ai", "tech", "urheilu"].map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(0); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                category === cat
                  ? "bg-brand text-white shadow-md shadow-brand/20"
                  : "bg-surface-dark text-slate-400 border border-surface-light/50 hover:text-white hover:border-brand/30"
              }`}
            >
              {cat === "all" ? "Kaikki" : cat === "urheilu" ? "Urheilu" : cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-surface-dark rounded-xl px-4 py-2 border border-surface-light/50">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <input
            type="range"
            min={1}
            max={10}
            value={minScore}
            onChange={(e) => { setMinScore(Number(e.target.value)); setPage(0); }}
            className="w-20 accent-brand"
          />
          <span className="text-sm text-white font-bold min-w-[2rem] text-center">{minScore}+</span>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl p-5 border border-surface-light/30 animate-shimmer">
              <div className="h-5 bg-surface-light/20 rounded-lg w-3/4 mb-3" />
              <div className="h-4 bg-surface-light/10 rounded-lg w-full mb-2" />
              <div className="h-4 bg-surface-light/10 rounded-lg w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {filtered.map((c, i) => (
              <ArticleCard
                key={c.id}
                title={c.articles.title}
                url={c.articles.url}
                summaryFi={c.summary_fi}
                sourceName={c.articles.sources?.name || "Tuntematon"}
                score={c.relevance_score}
                tags={c.tags || []}
                publishedAt={c.articles.published_at}
                index={i}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-slate-500">Ei tuloksia.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-surface border border-surface-light/50 rounded-xl text-sm text-white hover:border-brand/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Edellinen
              </button>
              <span className="text-sm text-slate-500 px-3">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-surface border border-surface-light/50 rounded-xl text-sm text-white hover:border-brand/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Seuraava
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
