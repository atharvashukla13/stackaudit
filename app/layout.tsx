import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StackAudit — AI Spend Audit for Startups",
  description:
    "Free AI tool spend audit. See where your team overspends on Cursor, Copilot, Claude, ChatGPT and more — and how much you could save.",
  openGraph: {
    title: "StackAudit — AI Spend Audit for Startups",
    description:
      "Free AI tool spend audit. See where your team overspends on Cursor, Copilot, Claude, ChatGPT and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StackAudit — AI Spend Audit for Startups",
    description:
      "Free AI tool spend audit. See where your team overspends on Cursor, Copilot, Claude, ChatGPT and more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
