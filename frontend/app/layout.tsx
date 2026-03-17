import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";

import { Providers } from "@/components/providers";
import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "ChefMate",
  description: "From your pantry to your plate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${playfair.variable} app-shell antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
