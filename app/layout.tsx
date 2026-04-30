import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kids Shape",
  description: "Draggable pastel shapes with react-konva",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
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
