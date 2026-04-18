import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "衣橱规划",
  description: "极简 AI 衣橱规划",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-dvh bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
