import type { Metadata } from "next";
import localFont from "next/font/local";
import AppToaster from "@/components/AppToaster";
import "./globals.css";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "讲人话：去AI味儿",
  description: "去掉套话、三段式和宣传腔，留下能读的句子。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-page font-sans text-ink">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
