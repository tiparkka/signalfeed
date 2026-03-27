import { supabase } from "@/lib/supabase";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";

export const revalidate = 300;

interface Props {
  params: Promise<{ date: string }>;
}

async function getDigest(date: string) {
  const { data } = await supabase
    .from("digests")
    .select("*")
    .eq("digest_date", date)
    .single();
  return data;
}

async function getDigestArticles(articleIds: string[]) {
  if (!articleIds || articleIds.length === 0) return [];

  const { data } = await supabase
    .from("curated_articles")
    .select(`
      id,
      relevance_score,
      tags,
      summary_fi,
      article_id,
      articles (
        title, url, published_at,
        sources (name)
      )
    `)
    .in("article_id", articleIds)
    .order("relevance_score", { ascending: false });

  return data || [];
}

export default async function DigestPage({ params }: Props) {
  const { date } = await params;
  const digest = await getDigest(date);

  if (!digest) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-3">Koostetta ei löydy.</p>
        <Link href="/archive" className="text-brand-light text-sm hover:underline">
          Takaisin arkistoon
        </Link>
      </div>
    );
  }

  const articles = await getDigestArticles(digest.article_ids || []);

  const dateStr = new Date(digest.digest_date).toLocaleDateString("fi-FI", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeStr = digest.created_at
    ? new Date(digest.created_at).toLocaleTimeString("fi-FI", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div>
      <Link
        href="/archive"
        className="inline-flex items-center gap-1.5 text-brand-light text-sm hover:underline mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Arkisto
      </Link>
      <h1 className="text-3xl font-bold text-white mb-1 capitalize animate-fade-in-up">
        {dateStr}
      </h1>
      <div className="flex items-center gap-3 text-sm text-slate-500 mb-6">
        <span>{digest.article_count} artikkelia</span>
        {timeStr && (
          <>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Luotu klo {timeStr}
            </span>
          </>
        )}
      </div>

      {digest.intro_text && (
        <div className="bg-gradient-to-br from-surface to-surface-dark rounded-2xl p-6 border border-brand/15 mb-8 animate-fade-in-up stagger-1">
          <p className="text-slate-200 leading-relaxed">{digest.intro_text}</p>
        </div>
      )}

      <div className="grid gap-4">
        {articles.map((c: any, i: number) => (
          <ArticleCard
            key={c.id}
            title={c.articles.title}
            url={c.articles.url}
            summaryFi={c.summary_fi || ""}
            sourceName={c.articles.sources?.name || "Tuntematon"}
            score={c.relevance_score}
            tags={c.tags || []}
            publishedAt={c.articles.published_at}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
