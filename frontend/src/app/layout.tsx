import type { Metadata } from "next";
// 1. Replaced fonts with a more modern, professional combination
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

// Configuration for the heading/logo font
const montserrat = Montserrat({
  variable: "--font-logo", // This variable name is from your globals.css
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Configuration for the main body/tagline font
const inter = Inter({
  variable: "--font-tagline", // This variable name is from your globals.css
  subsets: ["latin"],
  weight: ["400", "700"],
});

// 2. Updated all metadata for SEO and social sharing
export const metadata: Metadata = {
  title: "ESS 2025 Index | AI-Powered Insights",
  description: "An interactive dashboard for visualizing Environmental and Social Standards Index 2025",
  icons: {
    icon: "/adb-favicon.ico", // TODO: Replace with your new favicon file
  },
  openGraph: {
    title: "ESS 2025 Index",
    description: "AI-powered insights into Environmental and Social Standards Index 2025",
    url: "https://your-final-app-url.com", // TODO: Update when you have a final domain
    images: [
      {
        url: "https://your-final-app-url.com/og-image.png", // TODO: Create and upload a social sharing image
        width: 1200,
        height: 630,
        alt: "ESS 2025 Index Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ESS 2025 Index",
    description: "AI-powered insights into the Environmental and Social Standards Index 2025",
    images: ["https://your-final-app-url.com/og-image.png"], // TODO: Use the same social image URL
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