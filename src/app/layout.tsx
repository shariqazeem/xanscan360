import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "XanScan 360 | Immersive Xandeum Analytics",
  description: "Hollywood-grade analytics dashboard for Xandeum pNode network. Live gossip visualization, geospatial ping tracking, voice commands, and real-time network monitoring.",
  keywords: ["Xandeum", "pNode", "Solana", "blockchain", "storage", "analytics", "dashboard", "3D globe", "network visualization"],
  openGraph: {
    title: "XanScan 360 | Immersive Xandeum Analytics",
    description: "The cinematic command center for Xandeum Network. Monitor pNodes in real-time with voice commands and 3D visualization.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950`}
      >
        {children}
      </body>
    </html>
  );
}
