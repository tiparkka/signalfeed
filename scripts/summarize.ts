import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { supabase } from "./lib/supabase.js";

const anthropic = new Anthropic();
const resend = new Resend(process.env.RESEND_API_KEY);

const MIN_SCORE = 7;
const MAX_ARTICLES = 15;

async function generateDigest() {
  console.log("Generoidaan päivän kooste...");

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Hae parhaiten pisteytetyt artikkelit
  const { data: curated, error } = await supabase
    .from("curated_articles")
    .select(`
      id,
      relevance_score,
      reasoning,
      topics,
      articles (
        id, title, url, author, published_at, content,
        sources (name, category, language)
      )
    `)
    .gte("relevance_score", MIN_SCORE)
    .gte("curated_at", oneDayAgo)
    .is("summary_fi", null)
    .order("relevance_score", { ascending: false })
    .limit(MAX_ARTICLES);

  if (error) {
    throw new Error(`Haku epäonnistui: ${error.message}`);
  }

  if (!curated || curated.length === 0) {
    console.log("Ei uusia artikkeleita tiivistettäväksi.");
    return;
  }

  console.log(`Tiivistetään ${curated.length} artikkelia suomeksi...`);

  const articleTexts = curated
    .map((c, idx) => {
      const a = c.articles as any;
      return `${idx + 1}. "${a.title}" (${a.sources?.name || "tuntematon"}, pisteet: ${c.relevance_score}/10)
   Aiheet: ${c.topics.join(", ")}
   Sisältö: ${a.content?.slice(0, 500) || "Ei sisältöä saatavilla"}
   URL: ${a.url}`;
    })
    .join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Olet suomalainen tech-toimittaja. Kirjoita jokaisesta artikkelista lyhyt, informatiivinen suomenkielinen tiivistelmä (2-3 lausetta).

Lisäksi kirjoita koosteen alussa lyhyt johdanto päivän tärkeimmistä teemoista.

Artikkelit:
${articleTexts}

Vastaa JSON-muodossa:
{
  "intro": "Johdantoteksti päivän teemoista",
  "summaries": [
    {
      "index": 1,
      "summary_fi": "Suomenkielinen tiivistelmä"
    }
  ]
}

Vastaa VAIN JSON-objektilla, ei muuta tekstiä.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  let parsed: { intro: string; summaries: { index: number; summary_fi: string }[] };
  try {
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("JSON-parsinta epäonnistui");
    return;
  }

  // Päivitä tiivistelmät tietokantaan
  for (const s of parsed.summaries) {
    const item = curated[s.index - 1];
    if (!item) continue;

    await supabase
      .from("curated_articles")
      .update({ summary_fi: s.summary_fi })
      .eq("id", item.id);
  }

  // Rakenna HTML-kooste
  const now = new Date();
  const dateStr = now.toLocaleDateString("fi-FI", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const articlesHtml = curated
    .map((c, idx) => {
      const a = c.articles as any;
      const summary =
        parsed.summaries.find((s) => s.index === idx + 1)?.summary_fi || "";
      return `<div style="margin-bottom:20px;padding:16px;border-left:3px solid #6366f1;background:#f8fafc;">
  <h3 style="margin:0 0 8px;"><a href="${a.url}" style="color:#1e293b;text-decoration:none;">${a.title}</a></h3>
  <p style="margin:0 0 8px;color:#475569;font-size:14px;">${a.sources?.name || ""} · Pisteet: ${c.relevance_score}/10 · ${c.topics.join(", ")}</p>
  <p style="margin:0;color:#334155;">${summary}</p>
</div>`;
    })
    .join("\n");

  const html = `<div style="max-width:640px;margin:0 auto;font-family:system-ui,sans-serif;">
  <h1 style="color:#1e293b;">SignalFeed · ${dateStr}</h1>
  <p style="color:#475569;font-size:16px;line-height:1.6;">${parsed.intro}</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
  ${articlesHtml}
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
  <p style="color:#94a3b8;font-size:12px;text-align:center;">SignalFeed – AI-kuratoitu tech-kooste</p>
</div>`;

  const plainText = `SignalFeed · ${dateStr}\n\n${parsed.intro}\n\n` +
    curated
      .map((c, idx) => {
        const a = c.articles as any;
        const summary =
          parsed.summaries.find((s) => s.index === idx + 1)?.summary_fi || "";
        return `${idx + 1}. ${a.title}\n   ${a.sources?.name || ""} · ${c.relevance_score}/10\n   ${summary}\n   ${a.url}`;
      })
      .join("\n\n");

  // Tallenna kooste
  const title = `SignalFeed · ${dateStr}`;
  const { error: digestError } = await supabase.from("digests").insert({
    title,
    content_html: html,
    content_text: plainText,
    article_count: curated.length,
  });

  if (digestError) {
    console.error(`Koosteen tallennus epäonnistui: ${digestError.message}`);
  }

  // Lähetä sähköposti aktiivisille tilaajille
  const { data: subscribers } = await supabase
    .from("user_preferences")
    .select("email, name")
    .eq("active", true);

  if (subscribers && subscribers.length > 0 && process.env.RESEND_API_KEY) {
    for (const sub of subscribers) {
      try {
        await resend.emails.send({
          from: "SignalFeed <digest@signalfeed.fi>",
          to: sub.email,
          subject: title,
          html,
          text: plainText,
        });
        console.log(`  Sähköposti lähetetty: ${sub.email}`);
      } catch (err) {
        console.error(`  Sähköpostivirhe ${sub.email}: ${(err as Error).message}`);
      }
    }
  }

  // Merkitse kooste lähetetyksi
  await supabase
    .from("digests")
    .update({ sent_at: new Date().toISOString() })
    .eq("title", title);

  console.log(`\nKooste valmis! ${curated.length} artikkelia, ${subscribers?.length || 0} tilaajaa.`);
}

generateDigest().catch(console.error);
