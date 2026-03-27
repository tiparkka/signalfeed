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
    setArticles((data as any) || []);
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

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Feed</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Haku..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface border border-surface-light rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand w-64"
        />

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(0); }}
          className="bg-surface border border-surface-light rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
        >
          <option value="all">Kaikki kategoriat</option>
          <option value="ai">AI</option>
          <option value="tech">Tech</option>
        </select>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Min. pisteet:</label>
          <input
            type="range"
            min={1}
            max={10}
            value={minScore}
            onChange={(e) => { setMinScore(Number(e.target.value)); setPage(0); }}
            className="w-24 accent-brand"
          />
          <span className="text-sm text-white font-medium w-8">{minScore}</span>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Ladataan...</p>
      ) : (
        <>
          <div className="grid gap-4">
            {filtered.map((c) => (
              <ArticleCard
                key={c.id}
                title={c.articles.title}
                url={c.articles.url}
                summaryFi={c.summary_fi}
                sourceName={c.articles.sources?.name || "Tuntematon"}
                score={c.relevance_score}
                tags={c.tags || []}
                publishedAt={c.articles.published_at}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-slate-500">Ei tuloksia.</p>
          )}
          <div className="flex gap-3 mt-8 justify-center">
            {page > 0 && (
              <button
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-surface border border-surface-light rounded-lg text-sm text-white hover:border-brand transition-colors"
              >
                Edellinen
              </button>
            )}
            {articles.length === PAGE_SIZE && (
              <button
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-surface border border-surface-light rounded-lg text-sm text-white hover:border-brand transition-colors"
              >
                Seuraava
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
