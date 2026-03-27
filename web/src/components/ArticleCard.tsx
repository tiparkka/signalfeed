interface ArticleCardProps {
  title: string;
  url: string;
  summaryFi: string;
  sourceName: string;
  score: number;
  tags: string[];
  publishedAt: string | null;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins} min sitten`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h sitten`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}pv sitten`;
  return date.toLocaleDateString("fi-FI");
}

function ScoreBadge({ score }: { score: number }) {
  let color = "bg-slate-600";
  if (score >= 9) color = "bg-emerald-600";
  else if (score >= 7) color = "bg-brand";
  else if (score >= 5) color = "bg-amber-600";

  return (
    <span className={`${color} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
      {score}/10
    </span>
  );
}

export default function ArticleCard({
  title,
  url,
  summaryFi,
  sourceName,
  score,
  tags,
  publishedAt,
}: ArticleCardProps) {
  return (
    <article className="bg-surface rounded-xl p-5 border border-surface-light/50 hover:border-brand/40 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white font-medium hover:text-brand-light transition-colors leading-snug"
        >
          {title}
        </a>
        <ScoreBadge score={score} />
      </div>
      <p className="text-slate-300 text-sm leading-relaxed mb-3">{summaryFi}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="text-brand-light font-medium">{sourceName}</span>
          {publishedAt && (
            <>
              <span>·</span>
              <span>{timeAgo(publishedAt)}</span>
            </>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-brand/10 text-brand-light text-xs px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
