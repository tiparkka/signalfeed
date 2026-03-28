import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "./lib/supabase.js";

const anthropic = new Anthropic();

const MIN_SCORE = 6;
const MAX_ARTICLES = 10;

async function generateDigest() {
  console.log("Generoidaan päivän kooste...");

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Hae parhaiten pisteytetyt artikkelit joilla on tiivistelmä
  const { data: curated, error } = await supabase
    .from("curated_articles")
    .select(`
      id,
      article_id,
      relevance_score,
      reasoning,
      tags,
      summary_fi,
      articles (
        id, title, url, author, published_at,
        sources (name, category)
      )
    `)
    .gte("relevance_score", MIN_SCORE)
    .not("summary_fi", "is", null)
    .gte("curated_at", oneDayAgo)
    .order("relevance_score", { ascending: false })
    .limit(MAX_ARTICLES);

  if (error) {
    throw new Error(`Haku epäonnistui: ${error.message}`);
  }

  if (!curated || curated.length === 0) {
    console.log("Ei artikkeleita koostettavaksi.");
    return;
  }

  // Generoi johdantoteksti Claudella
  const topTitles = curated
    .slice(0, 5)
    .map((c) => (c.articles as any).title)
    .join("\n- ");

  const introMessage = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Olet AI Suomi -uutispalvelun toimittaja. Kirjoita 2-3 lauseen katsaus päivän AI/tech-uutisista perustuen näihin otsikoihin:

- ${topTitles}

Tyyli: tiivis, informatiivinen, suomalainen perspektiivi.
Ei tervehdyksiä tai "tänään"-sanoja alussa.`,
      },
    ],
  });

  const introText =
    introMessage.content[0].type === "text"
      ? introMessage.content[0].text.trim()
      : "";

  // Muotoile ja tulosta kooste konsoliin
  const now = new Date();
  const dateStr = now.toLocaleDateString("fi-FI", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  console.log("\n" + "=".repeat(60));
  console.log(`  SIGNALFEED · ${dateStr}`);
  console.log("=".repeat(60));
  console.log(`\n${introText}\n`);
  console.log("-".repeat(60));

  for (let i = 0; i < curated.length; i++) {
    const c = curated[i];
    const a = c.articles as any;

    console.log(`\n${i + 1}. ${a.title}`);
    console.log(`   ${a.sources?.name || "tuntematon"} · Pisteet: ${c.relevance_score}/10`);
    console.log(`   Tagit: ${c.tags.join(", ")}`);
    console.log(`   ${c.summary_fi}`);
    console.log(`   → ${a.url}`);
  }

  console.log("\n" + "=".repeat(60));

  // Tallenna kooste tietokantaan
  const today = now.toISOString().split("T")[0];
  const title = `SignalFeed · ${dateStr}`;
  const articleIds = curated.map((c) => c.article_id);

  const { error: digestError } = await supabase.from("digests").upsert(
    {
      digest_date: today,
      title,
      intro_text: introText,
      article_ids: articleIds,
      article_count: curated.length,
    },
    { onConflict: "digest_date" }
  );

  if (digestError) {
    console.error(`Koosteen tallennus epäonnistui: ${digestError.message}`);
  }

  // Merkitse artikkelit featured-statuksella
  for (const c of curated) {
    await supabase
      .from("curated_articles")
      .update({ is_featured: true })
      .eq("id", c.id);
  }

  console.log(
    `\nKooste tallennettu! ${curated.length} artikkelia, päivämäärä: ${today}`
  );
}

generateDigest().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
