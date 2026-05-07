import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://kids-shape.ikk-dev.jp"
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "かたち・あそび",
  description:
    "やわらかい色の図形をはめるパズル。自由に遊ぶモードと、やさしい順から鬼までの問題モードがあります。",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  },
  openGraph: {
    title: "かたち・あそび",
    description:
      "やわらかい色の図形をはめるパズル。自由に遊ぶモードと、やさしい順から鬼までの問題モードがあります。",
    type: "website",
    locale: "ja_JP",
    images: [
      {
        url: "/og.png",
        width: 391,
        height: 412,
        alt: "かたち：パステルカラーの図形が並んだイメージ"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "かたち・あそび",
    description:
      "やわらかい色の図形をはめるパズル。自由に遊ぶモードと、やさしい順から鬼までの問題モードがあります。",
    images: ["/og.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
