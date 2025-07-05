import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SuiProvider from "./SuiProvider";
import Navigation from "@/components/Navigation";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SweepChain - Transparent & Fair Sweepstakes on Blockchain",
  description:
    "Run provably fair sweepstakes campaigns with blockchain transparency. Built on Sui for instant finality and minimal fees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased `}>
        <SuiProvider>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1 pt-16">{children}</main>
          </div>
        </SuiProvider>
      </body>
    </html>
  );
}
