import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Agent from "./components/Agent";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GroupBenefitz - Corporate Admin Platform",
  description: "Enterprise-grade SaaS Admin Platform for Corporate Benefits Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Agent />
      </body>
    </html>
  );
}
