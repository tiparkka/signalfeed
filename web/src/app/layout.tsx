import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalFeed – AI-kuratoitu tech-kooste",
  description:
    "AI-pohjainen uutiskuraattori, joka pisteyttää ja tiivistää päivän tärkeimmät AI/tech-uutiset suomeksi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi">
      <body className="font-sans antialiased">
        <Nav />
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-surface-light mt-16 py-8 text-center text-xs text-slate-500">
          SignalFeed — AI-kuratoitu tech-kooste
        </footer>
      </body>
    </html>
  );
}
