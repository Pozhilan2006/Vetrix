import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "../context/WalletContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Aura V2 — Autonomous AI Web3 Agent",
  description:
    "Autonomous AI Web3 agent. Type naturally, execute blockchain transactions instantly. No MetaMask popups — the bot handles everything.",
  keywords: ["Web3", "AI", "blockchain", "autonomous agent", "Ethereum", "Sepolia", "chatbot", "DeFi"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-[#0a0a1a] text-white`}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
