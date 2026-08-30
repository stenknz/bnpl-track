import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "DueFlow",
  description: "Track your Afterpay and installment payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("theme")||"system";var r=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme:dark)").matches);if(r)document.documentElement.classList.add("dark")}catch(e){}})()`,
        }} />
      </head>
      <body className={`${inter.variable} ${fraunces.variable} ${mono.variable} font-sans antialiased bg-[#FAF6F0] dark:bg-[#120C08] text-[#2A1F15] dark:text-[#F0E4D8]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
