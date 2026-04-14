import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TODO App",
  description: "Next.js + Spring Boot TODO",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
