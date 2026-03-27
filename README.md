# SignalFeed

AI-kuratoitu tech-uutiskooste, joka hakee RSS-feedeistä artikkeleita, pisteyttää ne Claude API:lla ja generoi suomenkieliset tiivistelmät.

## Arkkitehtuuri

```
RSS-feedit → fetch-rss.ts → Supabase (articles)
                                ↓
                          curate.ts → Claude API → Supabase (curated_articles)
                                ↓
                        summarize.ts → Claude API → Suomenkielinen kooste → Sähköposti (Resend)
```

## Teknologiat

- **TypeScript** + tsx
- **Claude API** (Anthropic) – artikkelien pisteytys ja tiivistelmät
- **Supabase** – tietokanta ja autentikaatio
- **Resend** – sähköpostikoosteet
- **rss-parser** – RSS-feedien jäsentäminen
- **GitHub Actions** – automaattinen ajastus 4x/päivä

## Asennus

### 1. Kloonaa ja asenna riippuvuudet

```bash
git clone https://github.com/tiparkka/signalfeed.git
cd signalfeed
npm install
```

### 2. Konfiguroi ympäristömuuttujat

```bash
cp .env.example .env
```

Täytä `.env`-tiedostoon:

| Muuttuja | Kuvaus |
|----------|--------|
| `SUPABASE_URL` | Supabase-projektin URL |
| `SUPABASE_KEY` | Supabase anon/service key |
| `ANTHROPIC_API_KEY` | Anthropic API-avain |
| `RESEND_API_KEY` | Resend API-avain sähköposteja varten |

### 3. Luo tietokanta

Aja migraatio Supabase-projektissasi:

```bash
supabase db push
```

Tai kopioi `supabase/migrations/001_initial_schema.sql` sisältö Supabasen SQL-editoriin.

### 4. Lisää RSS-lähteet

```bash
npm run seed
```

Tämä lisää 25 esikonforoitua lähdettä (5 suomalaista + 20 kansainvälistä).

## Käyttö

### Yksittäiset vaiheet

```bash
# Hae uudet artikkelit RSS-feedeistä
npm run fetch

# Pisteytä artikkelit Claude API:lla
npm run curate

# Generoi suomenkieliset tiivistelmät ja lähetä kooste
npm run summarize
```

### Koko pipeline kerralla

```bash
npm run digest
```

### Automaattinen ajastus

GitHub Actions ajaa koko pipelinen automaattisesti 4 kertaa päivässä (klo 09, 13, 17 ja 21 Suomen aikaa). Konfiguroi GitHub-reposi secrets:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`

## Tietokantataulut

| Taulu | Kuvaus |
|-------|--------|
| `sources` | RSS-lähteet (nimi, URL, kategoria, kieli) |
| `articles` | Haetut artikkelit |
| `curated_articles` | Pisteytetyt artikkelit (score, topics, tiivistelmä) |
| `digests` | Lähetetyt koosteet (HTML + teksti) |
| `user_preferences` | Tilaajien asetukset (min. pisteet, kategoriat) |

## RSS-lähteet

### Suomalaiset (5)
Tekniikka & Talous, Tivi, Mikrobitti, Muropaketti, Helsinki Times

### Kansainväliset AI/tech (20)
TechCrunch AI, The Verge AI, Ars Technica, MIT Technology Review, VentureBeat AI, Hacker News, The Information, Wired AI, AI News, OpenAI Blog, Google AI Blog, Hugging Face Blog, Anthropic Blog, Papers With Code, Import AI, The Batch, Stratechery, Benedict Evans, Simon Willison, Semafor Tech

## Lisenssi

MIT
