import type { Metadata } from "next";
import { 
  Inter, 
  Roboto, 
  Poppins, 
  Plus_Jakarta_Sans, 
  Outfit, 
  Space_Grotesk, 
  Lora, 
  Fira_Code 
} from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-roboto" });
const poppins = Poppins({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-poppins" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const fira = Fira_Code({ subsets: ["latin"], variable: "--font-fira" });

export const metadata: Metadata = {
  title: "ClixProCRM",
  description:
    "ClixProCRM dashboard for sales, customers, pipeline, quotations, tasks, and reports.",
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`h-full antialiased ${inter.variable} ${roboto.variable} ${poppins.variable} ${jakarta.variable} ${outfit.variable} ${space.variable} ${lora.variable} ${fira.variable}`} 
      suppressHydrationWarning 
      data-scroll-behavior="smooth"
    >
      <body className="flex flex-col min-h-full font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}












