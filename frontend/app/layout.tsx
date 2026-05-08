import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "ClientRise CRM",
  description:
    "ClientRise CRM dashboard for sales, customers, pipeline, quotations, tasks, and reports.",
};

import { SettingsProvider } from "@/components/dashboard/SettingsContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-full font-sans">
        <SettingsProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
