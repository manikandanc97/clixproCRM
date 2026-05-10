import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "ClientRise CRM",
  description:
    "ClientRise CRM dashboard for sales, customers, pipeline, quotations, tasks, and reports.",
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${jakarta.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="flex flex-col min-h-full font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
