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
      <div>
        <p className="text-slate-500">Koostetta ei loydy.</p>
        <Link href="/archive" className="text-brand-light text-sm mt-2 inline-block">
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

  return (
    <div>
      <Link
        href="/archive"
        className="text-brand-light text-sm hover:underline mb-4 inline-block"
      >
        &larr; Arkisto
      </Link>
      <h1 className="text-3xl font-bold text-white mb-1 capitalize">
        {dateStr}
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        {digest.article_count} artikkelia
      </p>

      {digest.intro_text && (
        <div className="bg-surface rounded-xl p-6 border border-brand/20 mb-8">
          <p className="text-slate-200 leading-relaxed">{digest.intro_text}</p>
        </div>
      )}

      <div className="grid gap-4">
        {articles.map((c: any) => (
          <ArticleCard
            key={c.id}
            title={c.articles.title}
            url={c.articles.url}
            summaryFi={c.summary_fi || ""}
            sourceName={c.articles.sources?.name || "Tuntematon"}
            score={c.relevance_score}
            tags={c.tags || []}
            publishedAt={c.articles.published_at}
          />
        ))}
      </div>
    </div>
  );
}
