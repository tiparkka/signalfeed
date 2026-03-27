import Parser from "rss-parser";
import { supabase } from "./lib/supabase.js";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "SignalFeed/1.0",
  },
});

async function fetchAllFeeds() {
  console.log("Haetaan aktiiviset RSS-lähteet...");

  const { data: sources, error } = await supabase
    .from("sources")
    .select("*")
    .eq("active", true);

  if (error) {
    throw new Error(`Lähteiden haku epäonnistui: ${error.message}`);
  }

  if (!sources || sources.length === 0) {
    console.log("Ei aktiivisia lähteitä. Aja ensin: npm run seed");
    return;
  }

  console.log(`Löydettiin ${sources.length} aktiivista lähdettä`);

  let totalNew = 0;

  for (const source of sources) {
    try {
      console.log(`Haetaan: ${source.name} (${source.feed_url})`);
      const feed = await parser.parseURL(source.feed_url);

      const articles = (feed.items || []).map((item) => ({
        source_id: source.id,
        title: item.title?.trim() || "Ei otsikkoa",
        url: item.link || item.guid || "",
        author: item.creator || item.author || null,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
        content: item.content || item.contentSnippet || null,
        content_snippet: (item.contentSnippet || item.content || "").slice(0, 500) || null,
      }));

      // Suodata pois artikkelit joilla ei ole URL:ia
      const validArticles = articles.filter((a) => a.url);

      if (validArticles.length === 0) {
        console.log(`  Ei artikkeleita: ${source.name}`);
        continue;
      }

      // Upsert - ohita duplikaatit URL:n perusteella
      const { data, error: insertError } = await supabase
        .from("articles")
        .upsert(validArticles, { onConflict: "url", ignoreDuplicates: true })
        .select("id");

      if (insertError) {
        console.error(`  Virhe tallennettaessa ${source.name}: ${insertError.message}`);
        continue;
      }

      const newCount = data?.length || 0;
      totalNew += newCount;
      console.log(`  ${source.name}: ${newCount} uutta artikkelia`);
    } catch (err) {
      console.error(`  Virhe haettaessa ${source.name}: ${(err as Error).message}`);
    }
  }

  console.log(`\nValmis! Yhteensä ${totalNew} uutta artikkelia tallennettu.`);
}

fetchAllFeeds().catch(console.error);
