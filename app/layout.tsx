import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/custom/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WC 2026 | Predigod",
  description: "Predict the matches, beat your friends, lead the table!",
  openGraph: {
    title: "World Cup 2026 Tipping",
    description: "Predict. Win. Lead.",
    url: "https://wc2026-tipp.vercel.app",
    siteName: "WC2026 Tipping",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "World Cup 2026 Tipping",
    description: "Predict. Win. Lead.",
    images: ["/og"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-950 min-h-screen text-slate-100`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
