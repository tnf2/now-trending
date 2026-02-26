import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://now-trend.ing"),
  title: {
    default: "now-trend.ing — Discover What's Trending Right Now",
    template: "%s | now-trend.ing",
  },
  description:
    "Search any topic and instantly discover related trending searches from Google Trends. See what's hot right now with real-time trending topics, search volume data, and trend breakdowns.",
  keywords: [
    "trending topics",
    "trending searches",
    "google trends search",
    "trending now",
    "current trends",
    "trending topics today",
    "google trends today",
    "what's trending now",
    "google trends",
    "search trends",
    "trend discovery",
    "real-time trends",
  ],
  authors: [{ name: "now-trend.ing" }],
  creator: "now-trend.ing",
  publisher: "now-trend.ing",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://now-trend.ing",
    siteName: "now-trend.ing",
    title: "now-trend.ing — Discover What's Trending Right Now",
    description:
      "Search any topic and instantly discover related trending searches from Google Trends. Real-time trending topics with search volume data.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "now-trend.ing — Discover What's Trending",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "now-trend.ing — Discover What's Trending Right Now",
    description:
      "Search any topic and instantly discover related trending searches from Google Trends.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://now-trend.ing",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "theme-color": "#09090b",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

function JsonLd() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "now-trend.ing",
    url: "https://now-trend.ing",
    description:
      "Search any topic and discover related trending searches from Google Trends. Real-time trending topics with search volume data.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://now-trend.ing/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "now-trend.ing",
    url: "https://now-trend.ing",
    logo: "https://now-trend.ing/og-image.png",
    sameAs: [],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "now-trend.ing",
    url: "https://now-trend.ing",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description:
      "A real-time trending topic search engine powered by Google Trends data. Search any keyword and discover what's trending now.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Real-time trending topic search",
      "Google Trends data integration",
      "Search volume statistics",
      "Trend breakdown analysis",
      "Semantic search with AI embeddings",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <JsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100`}
      >
        {children}
      </body>
    </html>
  );
}
