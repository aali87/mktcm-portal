import type { Metadata } from "next";
import { Inter, Crimson_Text } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const crimsonText = Crimson_Text({
  weight: ['400', '600', '700'],
  subsets: ["latin"],
  variable: '--font-crimson-text',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Member Portal - Traditional Chinese Medicine Fertility",
  description: "Access your fertility programs, workshops, and wellness resources",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${crimsonText.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
