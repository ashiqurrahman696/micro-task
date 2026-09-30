import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Providers, TokenPersistor } from "@/components/providers";
import { ThemeScript } from "@/components/theme";

export const metadata: Metadata = {
  title: "MicroTask — Complete Small Tasks, Earn Real Rewards",
  description: "Micro-tasking and earning platform for workers, buyers and admins.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <Providers>
          <TokenPersistor />
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
