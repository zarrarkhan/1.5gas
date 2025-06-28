import type { Metadata } from "next";
// 1. Replaced fonts with a more modern, professional combination
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-logo",
  weight: ["400", "700"],
  subsets: ["latin"], // required
});

const inter = Inter({
  variable: "--font-tagline",
  weight: ["400", "700"],
  subsets: ["latin"], // required
});

// 2. Updated all metadata for SEO and social sharing
export const metadata: Metadata = {
  title: "Phasing Out Fossil Gas | 1.5°C Pathways Dashboard",
  description: "A case study for Climate Analytics: exploring global gas phaseout scenarios aligned with 1.5°C pathways.",
  icons: {
    icon: "/favicon.ico", 
  },
  openGraph: {
    title: "Phasing Out Fossil Gas | 1.5°C Pathways Dashboard",
    description: "A Climate Analytics case study exploring fossil gas reductions and BECCS pathway scenarios.",
    url: "https://main.d1n7nou6rui1bo.amplifyapp.com/",
    images: [
      {
        url: "https://main.d1n7nou6rui1bo.amplifyapp.com/og-image.jpeg", 
        width: 1200,
        height: 630,
        alt: "1.5°C Gas Dashboard – Climate Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phasing Out Fossil Gas | 1.5°C Pathways Dashboard",
    description: "Interactive data case study for Climate Analytics by Zarrar Khan",
    images: ["https://main.d1n7nou6rui1bo.amplifyapp.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 3. Applied the new font variables to the entire application
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}