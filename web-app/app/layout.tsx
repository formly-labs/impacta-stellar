import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});


export const metadata: Metadata = {
  title: "Formly - Verified data. Fair payments.",
  description: "A platform where form creators get quality data and contributors earn instantly for every verified response. Built on Stellar blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light scroll-smooth">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
