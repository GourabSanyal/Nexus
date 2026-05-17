import type { Metadata } from "next";
import localFont from "next/font/local";
import { themeInitScript } from "./lib/theme/themeInit";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Nexus",
    template: "%s | Nexus",
  },
  description: "Multi-chain wallet for Solana and Ethereum.",
  applicationName: "Nexus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="mt-12 flex flex-col justify-center items-center">
          {children}
        </div>
      </body>
    </html>
  );
}
