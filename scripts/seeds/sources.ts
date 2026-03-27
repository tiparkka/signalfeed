import { supabase } from "../lib/supabase.js";

const sources = [
  // Suomalaiset tech-mediat
  {
    name: "Tekniikka & Talous",
    url: "https://www.tekniikkatalous.fi",
    feed_url: "https://www.tekniikkatalous.fi/api/feed/v2/rss",
    category: "tech",
    language: "fi",
  },
  {
    name: "Tivi",
    url: "https://www.tivi.fi",
    feed_url: "https://www.tivi.fi/api/feed/v2/rss",
    category: "tech",
    language: "fi",
  },
  {
    name: "Mikrobitti",
    url: "https://www.mikrobitti.fi",
    feed_url: "https://www.mikrobitti.fi/feed/rss",
    category: "tech",
    language: "fi",
  },
  {
    name: "Muropaketti",
    url: "https://muropaketti.com",
    feed_url: "https://muropaketti.com/feed",
    category: "tech",
    language: "fi",
  },
  {
    name: "Helsinki Times – Tech",
    url: "https://www.helsinkitimes.fi",
    feed_url: "https://www.helsinkitimes.fi/feed",
    category: "tech",
    language: "fi",
  },

  // Kansainväliset AI/tech-mediat
  {
    name: "TechCrunch – AI",
    url: "https://techcrunch.com/category/artificial-intelligence",
    feed_url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    category: "ai",
    language: "en",
  },
  {
    name: "The Verge – AI",
    url: "https://www.theverge.com/ai-artificial-intelligence",
    feed_url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
    category: "ai",
    language: "en",
  },
  {
    name: "Ars Technica – AI",
    url: "https://arstechnica.com/ai",
    feed_url: "https://feeds.arstechnica.com/arstechnica/technology-lab",
    category: "ai",
    language: "en",
  },
  {
    name: "MIT Technology Review – AI",
    url: "https://www.technologyreview.com/topic/artificial-intelligence",
    feed_url: "https://www.technologyreview.com/feed/",
    category: "ai",
    language: "en",
  },
  {
    name: "VentureBeat – AI",
    url: "https://venturebeat.com/category/ai",
    feed_url: "https://venturebeat.com/category/ai/feed/",
    category: "ai",
    language: "en",
  },
  {
    name: "Hacker News",
    url: "https://news.ycombinator.com",
    feed_url: "https://hnrss.org/frontpage",
    category: "tech",
    language: "en",
  },
  {
    name: "The Information",
    url: "https://www.theinformation.com",
    feed_url: "https://www.theinformation.com/feed",
    category: "tech",
    language: "en",
  },
  {
    name: "Wired – AI",
    url: "https://www.wired.com/tag/artificial-intelligence",
    feed_url: "https://www.wired.com/feed/tag/ai/latest/rss",
    category: "ai",
    language: "en",
  },
  {
    name: "AI News",
    url: "https://www.artificialintelligence-news.com",
    feed_url: "https://www.artificialintelligence-news.com/feed/",
    category: "ai",
    language: "en",
  },
  {
    name: "OpenAI Blog",
    url: "https://openai.com/blog",
    feed_url: "https://openai.com/blog/rss.xml",
    category: "ai",
    language: "en",
  },
  {
    name: "Google AI Blog",
    url: "https://blog.google/technology/ai",
    feed_url: "https://blog.google/technology/ai/rss/",
    category: "ai",
    language: "en",
  },
  {
    name: "Hugging Face Blog",
    url: "https://huggingface.co/blog",
    feed_url: "https://huggingface.co/blog/feed.xml",
    category: "ai",
    language: "en",
  },
  {
    name: "Anthropic Blog",
    url: "https://www.anthropic.com/blog",
    feed_url: "https://www.anthropic.com/rss.xml",
    category: "ai",
    language: "en",
  },
  {
    name: "Papers With Code",
    url: "https://paperswithcode.com",
    feed_url: "https://paperswithcode.com/latest/rss",
    category: "ai",
    language: "en",
  },
  {
    name: "Import AI Newsletter",
    url: "https://importai.substack.com",
    feed_url: "https://importai.substack.com/feed",
    category: "ai",
    language: "en",
  },
  {
    name: "The Batch (deeplearning.ai)",
    url: "https://www.deeplearning.ai/the-batch",
    feed_url: "https://www.deeplearning.ai/the-batch/feed/",
    category: "ai",
    language: "en",
  },
  {
    name: "Stratechery",
    url: "https://stratechery.com",
    feed_url: "https://stratechery.com/feed/",
    category: "tech",
    language: "en",
  },
  {
    name: "Benedict Evans",
    url: "https://www.ben-evans.com",
    feed_url: "https://www.ben-evans.com/benedictevans?format=rss",
    category: "tech",
    language: "en",
  },
  {
    name: "Simon Willison",
    url: "https://simonwillison.net",
    feed_url: "https://simonwillison.net/atom/everything/",
    category: "ai",
    language: "en",
  },
  {
    name: "Semafor – Tech",
    url: "https://www.semafor.com/tech",
    feed_url: "https://www.semafor.com/feed/tech",
    category: "tech",
    language: "en",
  },
];

async function seedSources() {
  console.log("Lisätään RSS-lähteet...");

  const { data, error } = await supabase
    .from("sources")
    .upsert(sources, { onConflict: "feed_url", ignoreDuplicates: true })
    .select("id");

  if (error) {
    throw new Error(`Lähteiden lisäys epäonnistui: ${error.message}`);
  }

  console.log(`Valmis! ${data?.length || 0} lähdettä lisätty/päivitetty.`);
}

seedSources().catch(console.error);
