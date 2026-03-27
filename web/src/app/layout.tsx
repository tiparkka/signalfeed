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
        <footer className="border-t border-surface-light/30 mt-16 py-8">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand to-purple-500 flex items-center justify-center text-white font-bold text-[8px]">S</div>
              <span className="text-xs text-slate-500">SignalFeed — AI-kuratoitu tech-kooste</span>
            </div>
            <span className="text-xs text-slate-600">2026</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
