import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SpyCraft — AI-Powered Ad Creative Intelligence",
  description:
    "Track competitors, detect creative fatigue, and generate winning ad creatives. The intelligence platform for modern performance marketers.",
  openGraph: {
    title: "SpyCraft — AI-Powered Ad Creative Intelligence",
    description:
      "Track competitors, detect creative fatigue, and generate winning ad creatives.",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ background: "#040404" }}
    >
      <body className="min-h-screen antialiased" style={{ background: "#040404" }}>
        {children}
      </body>
    </html>
  );
}
