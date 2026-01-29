import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Agent from "@/components/Agent";
import AgentProvider from "@/components/AgentProvider";
import AgentUI from "@/components/AgentUi";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Max Insurance - Corporate Admin Platform",
  description:
    "Enterprise-grade SaaS Admin Platform for Corporate Benefits Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${inter.variable} antialiased`}>
        <AgentProvider />

        <div className='min-h-screen flex'>
          {/* Left sidebar */}
          <aside className='w-80 border-r bg-white hidden md:flex'>
            <div className='p-4 w-full'>
              <Agent />
            </div>
          </aside>

          {/* Main content */}
          <main className='flex-1 bg-gray-50'>
            <div className='max-w-7xl mx-auto p-6'>{children}</div>
          </main>

          {/* Right Agent UI */}
          <aside className='w-96 border-l bg-white hidden lg:flex flex-col'>
            <div className='p-4 w-full'>
              <AgentUI />
            </div>
          </aside>
        </div>
      </body>
    </html>
  );
}
